import * as vscode from 'vscode';

function getCursorPosition(document: vscode.TextDocument): vscode.Range {
    let position: vscode.Range = new vscode.Range(0, 0, 0, 0);
    let cursorFound = false;
    for (let i = 0; i < document.lineCount - 1 && !cursorFound; i++) {
        const ln = document.lineAt(i);
        if (/{cursor}/g.test(ln.text)) {
            cursorFound = true;
            position = new vscode.Range(ln.lineNumber, ln.firstNonWhitespaceCharacterIndex, ln.lineNumber, ln.text.length);
        }
    }
    return position;
}
function removeCursorPlaceholder(editor: vscode.TextEditor, range: vscode.Range) {
    editor.edit((editor) => editor.replace(range, ''));
}
export async function moveCursorToDefaultPosition(editor: vscode.TextEditor) {
    const range = getCursorPosition(editor.document);
    editor.selections = [new vscode.Selection(range.start, range.start)];
    removeCursorPlaceholder(editor, range);
    await editor.document.save();
    return;
}