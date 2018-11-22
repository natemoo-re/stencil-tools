import { workspace, ExtensionContext } from 'vscode';
import { LanguageClientOptions, ProposedFeatures } from 'vscode-languageclient';

export const getClientOptions = (_context: ExtensionContext): LanguageClientOptions => {
    return {
        documentSelector: [{ scheme: 'file', language: 'typescriptreact' }],
        synchronize: {
            fileEvents: [
                workspace.createFileSystemWatcher('**/stencil.config.{ts,js}', false, false, false),
                workspace.createFileSystemWatcher('**/*.{css,scss,sass,less,pcss,postcss,styl}', false, true, false),
                workspace.createFileSystemWatcher('**/*.{js,ts,tsx}', false, true, false)
            ]
        }
    }
}