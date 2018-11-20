import { generator } from '../index';
import * as vscode from 'vscode';
import * as path from 'path';
import { getStencilComponent, getComponentDir, showProgress } from './utils';

const GenerateTest = async (uri: vscode.Uri) => {
    const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor.document.fileName;
    const testsDir = path.dirname(filePath);
    const fileName = filePath.replace(testsDir, '').slice(1).split('.')[0];
    const sourceText = await vscode.workspace.openTextDocument(filePath).then(document => document.getText());
    const info = await getStencilComponent(filePath, sourceText);
    
    if (!info || info && (!info.tag || !info.className)) {
        await vscode.window.showErrorMessage('Unable to generate tests for file without a valid Stencil Component');
        return;
    }
    const componentPrefix = info.tag.replace(fileName, '');

    try {
        await showProgress(`Generating tests for "${info.tag}"`, () => {
            return generator.createTests(fileName, {
                baseDir: testsDir,
                componentClassName: info.className,
                componentPrefix
            })
        })
    } catch (deferred) {
        const files = deferred.split(', ');
        const result = await vscode.window.showWarningMessage(`${deferred} already ${files.length < 2 ? 'exists' : 'exist'}!`, `Overwrite ${files.length < 2 ? 'File' : 'Files'}`);
        if (result === undefined) return;

        await showProgress(`Overwriting ${deferred}`, () => {
            return generator.force()
        })
    }
    // await openDocument(componentDir, name);
    // await moveCursor(8, 0);
}

export default GenerateTest;