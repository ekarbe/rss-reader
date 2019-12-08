import * as vscode from 'vscode';
import * as reader from './reader';
import { IEntry, IFeedConfig } from './interface';

/**
 * Feed provider for the treeview
 */
export class RSSProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public title: string | undefined;
    public url: string | undefined;
    public id: number | undefined;

    constructor(feedConfig: IFeedConfig) {
        this.title = feedConfig.title;
        this.url = feedConfig.url;
        this.id = feedConfig.id;
        vscode.commands.executeCommand('setContext', `RSS-${this.id}-enabled`, true);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Adds treeitems to the treeview with `RSSReader.Open` command to open the link
     * 
     * @param element 
     */
    getTreeItem(element: IEntry): vscode.TreeItem {
        return new Article(element.title, vscode.TreeItemCollapsibleState.None, {
            command: 'RSSReader.Open',
            title: 'Open link',
            arguments: [element.link]
        });
    }

    /**
     * Requests the configured feed for this objects view
     * 
     * @param element 
     */
    getChildren(element?: any): Promise<Array<IEntry>> {
        return new Promise<any>((resolve, reject) => {
            if (this.url) {
                reader.XML(this.url)
                    .then(response => {
                        resolve(response.entries);
                    })
                    .catch(error => {
                        vscode.commands.executeCommand('setContext', `RSS-${this.id}-enabled`, false);
                        reject(error + " Thrown in feed - " + this.title);
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
     * Adds treeitems to the treeview with `RSSReader.Open` command to open the link
     * 
     * @param element 
     */
    getTreeItem(element: IEntry): vscode.TreeItem {
        return new Article(element.title, vscode.TreeItemCollapsibleState.None, {
            command: 'RSSReader.Open',
            title: '',
            arguments: [element.link]
        }
        );
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
                    promises.push(reader.XML(this.feeds[i].url));
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
        public readonly collapsableState: vscode.TreeItemCollapsibleState,
        public readonly command: vscode.Command
    ) {
        super(label, collapsableState);
    }
}