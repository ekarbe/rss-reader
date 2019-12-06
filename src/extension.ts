import * as vscode from 'vscode';
import { RSSProvider } from './provider';

export function activate(context: vscode.ExtensionContext) {
	const rssProvider = new RSSProvider();
	vscode.window.registerTreeDataProvider('RSS-1', rssProvider);
	vscode.commands.registerCommand('RSSReader.Refresh', () => rssProvider.refresh());

	let linkOpener = vscode.commands.registerCommand('RSSReader.Open', (link) => {
		vscode.env.openExternal(vscode.Uri.parse(link));
	});

	context.subscriptions.push(linkOpener);
}

export function deactivate() { }
