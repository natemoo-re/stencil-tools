import { generator } from '../index';
import * as vscode from 'vscode';
import { getComponentDir, showProgress, openDocument, moveCursor } from './utils';

const GenerateComponent = async (uri: vscode.Uri) => {
    
    const name = await vscode.window.showInputBox({ placeHolder: 'my-component' });
    if (name === undefined || !name.trim()) return;

    let componentDir: string = getComponentDir(uri);
    try {
        await showProgress(`Generating "${name}"`, () => generator.create(name, { baseDir: componentDir }));
        await openDocument(componentDir, name);
        await moveCursor(8, 0);
    } catch (deferred) {
        const files = deferred.split(', ');
        const result = await vscode.window.showWarningMessage(`${deferred} already ${files.length < 2 ? 'exists' : 'exist'}!`, `Overwrite ${files.length < 2 ? 'File' : 'Files'}`);
        if (result === undefined) return;

        await showProgress(`Overwriting ${deferred}`, () => {
            return generator.force();
        })
        await openDocument(componentDir, name);
        await moveCursor(8, 0);
    }
}

export default GenerateComponent;