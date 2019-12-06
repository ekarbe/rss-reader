import * as vscode from 'vscode';
import * as reader from './reader';

export class RSSProvider implements vscode.TreeDataProvider<any> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    public title: string | undefined;
    public link: string | undefined;
    public description: string | undefined;

    constructor() {
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
            reader.XML("http://feeds.bbci.co.uk/news/world/rss.xml")
                .then(response => {
                    resolve(response.entries);
                });
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