import * as vscode from 'vscode';

export enum DOCS {
    INDEX = 'https://stenciljs.com/docs/'
}

export function OpenDocs() {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(DOCS.INDEX));
}