import * as vscode from 'vscode';
import * as reader from './reader';
import { IEntry, IFeedConfig } from './interface';

/**
 * Feed provider for the treeview
 */
export class RSSProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public config: IFeedConfig;

    constructor(feedConfig: IFeedConfig) {
        this.config = feedConfig;
        vscode.commands.executeCommand('setContext', `RSS-${this.config.id}-enabled`, true);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Adds treeitems to the treeview with the primary command to open the link
     * 
     * @param element 
     */
    getTreeItem(element: IEntry): vscode.TreeItem {
        let command;
        if (vscode.workspace.getConfiguration('RSSReader').get('OpenType') === "OpenLink") {
            command = {
                command: 'RSSReader.OpenLink',
                title: 'Open link',
                arguments: [element.link],
            }
        } else {
            command = {
                command: 'RSSReader.OpenEditor',
                title: 'Open content',
                arguments: [element],
            }
        }
        return {
            label: element.title,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: command
        };
    }

    /**
     * Requests the configured feed for this objects view
     * 
     * @param element 
     */
    getChildren(element?: any): Promise<Array<IEntry>> {
        return new Promise<any>((resolve, reject) => {
            if (this.config) {
                reader.XML(this.config)
                    .then(response => {
                        resolve(response.entries);
                    })
                    .catch(error => {
                        vscode.commands.executeCommand('setContext', `RSS-${this.config.id}-enabled`, false);
                        reject(error + " Thrown in feed - " + this.config.title);
                    });
            }
        });

    }
}

/**
 * Consolidated feed provider for the treeview
 */
export class RSSCProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public feeds: Array<IFeedConfig>;

    constructor(feeds: Array<IFeedConfig>) {
        this.feeds = feeds;
        vscode.commands.executeCommand('setContext', `RSS-0-enabled`, true);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Adds treeitems to the treeview with the primary command to open the link
     * 
     * @param element 
     */
    getTreeItem(element: IEntry): vscode.TreeItem {
        let command;
        if (vscode.workspace.getConfiguration('RSSReader').get('OpenType') === "OpenLink") {
            command = {
                command: 'RSSReader.OpenLink',
                title: 'Open link',
                arguments: [element.link],
            }
        } else {
            command = {
                command: 'RSSReader.OpenEditor',
                title: 'Open content',
                arguments: [element],
            }
        }
        let item: vscode.TreeItem = {
            label: element.title,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: command
        };
        // add identifier
        if (vscode.workspace.getConfiguration('RSSReader').get('Identifier') && element.identifier) {
            // hacky way to add dynamic svg icon
            let lightIcon = vscode.Uri.parse(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='25' width='25' fill='black' style='font-family: Arial, Helvetica, sans-serif;font-size: 0.8em;'%3E%3Ctext x='0' y='15'%3E${element.identifier}%3C/text%3E%3C/svg%3E`, true);
            let darkIcon = vscode.Uri.parse(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='25' width='25' fill='white' style='font-family: Arial, Helvetica, sans-serif;font-size: 0.8em;'%3E%3Ctext x='0' y='15'%3E${element.identifier}%3C/text%3E%3C/svg%3E`, true);
            item.iconPath = { light: lightIcon, dark: darkIcon }
        }
        return item;
    }

    /**
     * Requests all feeds, concats them and sorts them by date.
     * Returns one big list of feed items. 
     * 
     * @param element 
     */
    getChildren(element?: any): Promise<Array<IEntry>> {
        return new Promise<any>(async (resolve, reject) => {
            if (this.feeds) {
                let promises: Array<Promise<any>> = [];
                // get all feeds from config object
                for (let i = 0; i < this.feeds.length; i++) {
                    promises.push(reader.XML(this.feeds[i]));
                }
                let entries: Array<IEntry> = [];
                // map promises to find faulty ones
                let results = await Promise.all(promises.map(p => p.catch(e => e)));
                // remove error responses
                let validResults = results.filter(result => !(typeof (result) !== "object"));
                // go through all feeds and concat them
                for (let i = 0; i < validResults.length; i++) {
                    if (validResults[i]) {
                        entries = [...entries, ...validResults[i].entries];
                    }
                }
                // sort all entries by published/updated date
                entries.sort(function (a, b) {
                    if (a.date && b.date) {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    } else {
                        return 0;
                    }
                });
                // resolve entries if there are any
                if (entries.length > 0) {
                    resolve(entries);
                } else {
                    reject("No data");
                }
            }
        });

    }
}

/**
 * Represents the feed items in the treeview
 */
export class Article extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}