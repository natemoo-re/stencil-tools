import * as ts from 'typescript';
import * as path from 'path';
import * as vscode from "vscode";

export const getComponentDir = (uri: vscode.Uri) => uri ? uri.fsPath : path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'src', 'components');
export const getTextDocumentPath = (componentPath: string, name: string) => path.join(componentPath, name, `${name}.tsx`);

export const showProgress = (title: string, callback: (progress?: vscode.Progress<{ message?: string, increment?: number }>) => Thenable<any>) => {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title
    }, (progress) => callback(progress))
}

export const openDocument = async (componentPath: string, name: string) => {
    const textDocumentPath = getTextDocumentPath(componentPath, name);
    const textDocument = await vscode.workspace.openTextDocument(textDocumentPath)
    return vscode.window.showTextDocument(textDocument)
}

export const moveCursor = (line: number, character: number) => {
    const editor = vscode.window.activeTextEditor;
    editor.selection = new vscode.Selection(line, character, line, character);
}

export const getStencilComponent = async (fileName: string, sourceText: string): Promise<{ tag: string, className: string }> => {
    try {
        const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ESNext);
        const classDeclaration: ts.ClassDeclaration = sourceFile.statements.find(n => ts.isClassDeclaration(n)) as ts.ClassDeclaration;
        
        const className = classDeclaration.name.text;
        const tag = getComponentDecoratorTag(classDeclaration, sourceFile);

        return { tag, className }
    } catch (e) {
        return undefined;
    }
}

function getComponentDecoratorTag(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): string | undefined {
    if (!node.decorators) return undefined;

    const componentDecorator = node.decorators.find(isDecoratorNamed('Component'));
    if (!componentDecorator) return undefined;

    const [componentOptions] = getDeclarationParameters(componentDecorator, sourceFile);

    if (!componentOptions.tag || componentOptions.tag.trim() === '') {
        return undefined;
    }

    return componentOptions.tag;
}

function isDecoratorNamed(name: string) {
    return (dec: ts.Decorator): boolean => {
        return (ts.isCallExpression(dec.expression) && ts.isIdentifier(dec.expression.expression) && dec.expression.expression.text === name);
    };
}

function evalText(text: string) {
    const fnStr = `return ${text};`;
    return new Function(fnStr)();
}

const getDeclarationParameters = (decorator: ts.Decorator, sourceFile: ts.SourceFile): any => {
    if (!ts.isCallExpression(decorator.expression)) {
        return [];
    }

    return decorator.expression.arguments.map((arg) => {
        return evalText(arg.getText(sourceFile).trim());
    });
};