import { workspace, ExtensionContext, commands } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { getServerOptions, getClientOptions } from './utils';
import { generator } from './commands';
import Commands from './commands';
import * as ts from 'typescript';

export const extensionTitle = 'stencilTools';
let client: LanguageClient;

export function activate(context: ExtensionContext) {

	registerCommands(context);
	attachClient(context);
	
	checkWorkspace();

	workspace.onDidChangeWorkspaceFolders((e) => {
		if (e.added) { checkWorkspace(); }
	})

	workspace.onDidChangeTextDocument((event) => {
		if (event.document.fileName.endsWith('components.d.ts')) generator.updateComponents();
	})
}

function registerCommands(context: ExtensionContext) {
	for (const [command, action] of Commands.entries()) {
		const disposable = commands.registerCommand(`extension.${extensionTitle}.${command}`, action);
		context.subscriptions.push(disposable);
	}
}

function attachClient(context: ExtensionContext) {
	const serverOptions = getServerOptions(context);
	const clientOptions = getClientOptions(context);

	client = new LanguageClient('stencilLanguageServer', 'Stencil Language Server', serverOptions, clientOptions);
	client.start();

	client.onReady().then(() => {
		client.onRequest('workspace/xfiles', async () => {
			console.log('Recieved workspace/xfiles request');
			const params = { base: workspace.workspaceFolders[0].uri.fsPath };
			const files = await workspace.findFiles(`${params.base}/**/*`);
			return files;
		})
	})
}

async function checkWorkspace() {
	workspace.findFiles('**/stencil.config.{js,ts}').then((uri) => {
		if (uri) { setContext() }
	});
	
	// vscode.workspace.findFiles('**/.stencilTools').then((uri) => {
	// 	if (uri) { onStartedProjectOpen(uri); }
	// });
}

async function setContext() {
	await commands.executeCommand('setContext', 'isStencilProject', true);
}