import * as path from 'path';
import { ExtensionContext } from 'vscode';
import { ServerOptions, TransportKind } from 'vscode-languageclient';

export const getServerOptions = (context: ExtensionContext): ServerOptions => {

    const serverModule = context.asAbsolutePath(path.join('node_modules', '@stencil-tools', 'languageserver', 'dist', 'ipc.js'));

    const run = { module: serverModule, transport: TransportKind.ipc };
    const debugOptions = { execArgv: ["--inspect=6009"] };
    const debug = { ...run, options: debugOptions };

    return { run, debug };
}