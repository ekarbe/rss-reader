import * as vscode from 'vscode';
import { RSSProvider, RSSCProvider } from './provider';
import { IFeedConfig } from './interface';

/**
 * Activates the extension
 * 
 * @param this 
 * @param context 
 */
export function activate(this: any, context: vscode.ExtensionContext) {
	let feeds: Array<IFeedConfig> | undefined = vscode.workspace.getConfiguration('RSSReader').get('Feeds');
	if (feeds) {
		// check setting if consolidated feed or divided
		if (vscode.workspace.getConfiguration('RSSReader').get('Consolidated')) {
			let RSSProvider = new RSSCProvider(feeds);
			vscode.commands.registerCommand('RSSReader.Refresh', () => RSSProvider.refresh());
			vscode.window.registerTreeDataProvider('RSS-0', RSSProvider);

			// set auto update
			if (vscode.workspace.getConfiguration('RSSReader').get('Update')) {
				setInterval(function () {
					RSSProvider.refresh();
				}, <number>vscode.workspace.getConfiguration('RSSReader').get('Interval') * 60000);
			}
		} else {
			for (let i = 0; i < feeds.length; i++) {
				feeds[i].id = i;
				this['RSSProvider' + i] = new RSSProvider(feeds[i]);

				// TODO: Fix this
				//vscode.commands.registerCommand('RSSReader.Refresh', () => this['RSSProvider' + i].refresh());

				this['RSSView' + i] = vscode.window.createTreeView('RSS-' + i, { treeDataProvider: this['RSSProvider' + i] });

				// waiting for proposed api to hit stable
				//this['RSSView' + i].title = feeds[i].title;

				// set auto update
				if (vscode.workspace.getConfiguration('RSSReader').get('Update')) {
					let extension = this;
					setInterval(function () {
						extension['RSSProvider' + i].refresh();
					}, <number>vscode.workspace.getConfiguration('RSSReader').get('Interval') * 60000);
				}
			}
		}
	}

	vscode.workspace.onDidChangeConfiguration(change => {
		if (change.affectsConfiguration("RSSReader")) {
			vscode.window.showInformationMessage(`If you want the changes to take effect, please reload the window.`, "Reload")
				.then(selection => {
					if (selection === "Reload") {
						vscode.commands.executeCommand("workbench.action.reloadWindow");
					}
				});
		}
	});

	// open link in browser
	let linkOpener = vscode.commands.registerCommand('RSSReader.Open', (link) => {
		vscode.env.openExternal(vscode.Uri.parse(link));
	});

	context.subscriptions.push(linkOpener);
}

export function deactivate() { }
