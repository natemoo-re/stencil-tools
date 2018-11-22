import * as ts from 'typescript';
import * as path from 'path';
import * as multimatch from 'multimatch';
// import { URItoName } from '../../../util';
import { TextDocumentIdentifier, CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { logger } from '../../../language-server';

export function flatten(value: string[] | string): string {
	return Array.isArray(value) ? value.join('\n') : value;
}

export function getDecoratorName(node: ts.Decorator): string {
	if (!ts.isDecorator(node)) return undefined;

	return ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression) && node.expression.expression.text;
}

interface PathCompletionOptions {
	relativeTo?: string;
	pattern?: string | string[];
	includeDirs?: boolean;
	includeFiles?: boolean;
}
export function providePathCompletions(textDocument: TextDocumentIdentifier, files: string[], opts: PathCompletionOptions = {}): CompletionItem[] {
	const name = textDocument.uri;

	opts = Object.assign({}, { relativeTo: '', pattern: '*', includeDirs: true, includeFiles: true }, opts);
	const currentPath = path.join(path.dirname(name), opts.relativeTo).replace('\%40', '@');

	const dirs = Array.from(new Set(files.map(p => path.dirname(p))));
	// TODO: FIX - Always includes subdir, if it exists...?
	const dirParts = dirs
		.map(dir => path.relative(path.dirname(name), dir))
		// .map(dir => { logger.info(dir); return dir; })
		.filter(dir => (!opts.relativeTo) ? (dir.indexOf('.') === -1) : (dir.indexOf('..') !== -1))
		.map(dir => dir.replace(opts.relativeTo, ''))
		.filter(dir => dir && dir.indexOf(path.sep) === -1 && dir.indexOf('..') === -1 && dir.indexOf('.') !== 0)
	const fileParts = files
		.map(file => path.relative(currentPath, file))
		.filter(file => file && file.indexOf(path.sep) === -1);

	const createFile = (p: string) => ({ label: p, kind: CompletionItemKind.File, sortText: `zzz-${p}` });
	const createFolder = (p: string) => ({ label: p, kind: CompletionItemKind.Folder, sortText: `aaa-${p}` });

	const completions: CompletionItem[] = [];
	
	if (opts.includeFiles) { completions.push(...multimatch(fileParts, opts.pattern).map(createFile)) }
	if (opts.includeDirs) { completions.push(...dirParts.map(createFolder)) }
	return completions;
}