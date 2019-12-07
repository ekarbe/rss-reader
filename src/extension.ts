import * as vscode from 'vscode';
import { RSSProvider, RSSCProvider } from './provider';

export interface IFeedConfig {
	title: string;
	url: string;
	id?: number;
}

export function activate(this: any, context: vscode.ExtensionContext) {
	let feeds: Array<IFeedConfig> | undefined = vscode.workspace.getConfiguration('RSSReader').get('Feeds');
	if (feeds) {
		// check setting if consolidated feed or divided
		if (vscode.workspace.getConfiguration('RSSReader').get('Consolidated')) {
			let RSSProvider = new RSSCProvider(feeds);
			vscode.commands.registerCommand('RSSReader.Refresh', () => RSSProvider.refresh());
			vscode.window.registerTreeDataProvider('RSS-0', RSSProvider);
		} else {
			for (let i = 0; i < feeds.length; i++) {
				feeds[i].id = i;
				this['RSSProvider' + i] = new RSSProvider(feeds[i]);
				//vscode.commands.registerCommand('RSSReader.Refresh', () => this['RSSProvider' + i].refresh());
				this['RSSView' + i] = vscode.window.createTreeView('RSS-' + i, { treeDataProvider: this['RSSProvider' + i] });
				// waiting for proposed api to hit stable
				//this['RSSView' + i].title = feeds[i].title;
			}
		}
	}

	let linkOpener = vscode.commands.registerCommand('RSSReader.Open', (link) => {
		vscode.env.openExternal(vscode.Uri.parse(link));
	});

	context.subscriptions.push(linkOpener);
}

export function deactivate() { }
