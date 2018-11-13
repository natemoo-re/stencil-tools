import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { getServerOptions, getClientOptions } from './utils';

let client: LanguageClient;

export function activate(context: ExtensionContext) {

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
