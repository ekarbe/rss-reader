import * as vscode from 'vscode';
import * as reader from './reader';
import { IFeedConfig } from './extension';

export class RSSProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public title: string | undefined;
    public url: string | undefined;

    constructor(feedConfig: IFeedConfig) {
        this.title = feedConfig.title;
        this.url = feedConfig.url;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: reader.IEntry): vscode.TreeItem {
        return {
            label: element.title,
            tooltip: element.title,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: {
                command: 'RSSReader.Open',
                title: '',
                arguments: [element.link]
            }
        };
    }

    getChildren(element?: any): Promise<Array<reader.IEntry>> {
        return new Promise<any>((resolve, reject) => {
            if (this.url) {
                reader.XML(this.url)
                    .then(response => {
                        resolve(response.entries);
                    });
            }
        });

    }
}

export class RSSCProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public feeds: Array<IFeedConfig>;

    constructor(feeds: Array<IFeedConfig>) {
        this.feeds = feeds;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: reader.IEntry): vscode.TreeItem {
        return {
            label: element.title,
            tooltip: element.title,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: {
                command: 'RSSReader.Open',
                title: '',
                arguments: [element.link]
            }
        };
    }

    getChildren(element?: any): Promise<Array<reader.IEntry>> {
        return new Promise<any>((resolve, reject) => {
            if (this.feeds) {
                let promises: Array<Promise<any>> = [];
                for (let i = 0; i < this.feeds.length; i++) {
                    promises.push(reader.XML(this.feeds[i].url));
                }
                let entries: Array<reader.IEntry> = [];
                Promise.all(promises)
                    .then(responses => {
                        for (let i = 0; i < responses.length; i++) {
                            entries = [...entries, ...responses[i].entries];
                        }
                        entries.sort(function (a, b) {
                            if (a.date && b.date) {
                                return b.date.getTime() - a.date.getTime();
                            } else {
                                return 0;
                            }
                        });
                        resolve(entries);
                    });
            }
        });

    }
}

export class Article extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsableState: vscode.TreeItemCollapsibleState,
        public readonly command: vscode.Command
    ) {
        super(label, collapsableState);
    }
}