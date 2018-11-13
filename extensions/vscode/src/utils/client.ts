import { workspace, ExtensionContext } from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';

export const getClientOptions = (_context: ExtensionContext): LanguageClientOptions => {
    return {
        documentSelector: [{ scheme: 'file', language: 'typescriptreact' }],
        synchronize: {
            fileEvents: [
                workspace.createFileSystemWatcher('**/stencil.config.{t,j}s'),
                workspace.createFileSystemWatcher('**/*.tsx')
            ]
        }
    }
}