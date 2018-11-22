import * as ts from 'typescript';
import { Range, TextEdit } from 'vscode-languageserver';

export interface ImportLine {
	range: Range;
	imports: string[];
	multiline: boolean;
}

function alphabetize(arr: string[]) {
	const alphabetized = arr.map((value, index) => {
		return { index, value: value.toLowerCase() }
	}).sort((a, b) => {
		if (a.value > b.value) { return 1; }
		if (a.value < b.value) { return -1; }
		return 0;
	});

	return alphabetized.map((el) => arr[el.index]);
}

export function getStencilImport(sourceFile: ts.SourceFile): ImportLine {
	return getImport(sourceFile, '@stencil/core');
}
export function getRouterImport(sourceFile: ts.SourceFile): ImportLine {
	return getImport(sourceFile, '@stencil/router');
}

export function getAutoImportEdit(importLine: ImportLine, insertText: string): TextEdit[] {
	const edits = [];
	const { range, imports, multiline } = importLine;
	const sep = multiline ? '\n' : ' ';
	// TODO fix indentation logic... just hardcoded for now
	const indent = multiline ? '\t' : '';

	if (imports.length && !imports.includes(insertText)) {
		imports.push(insertText);
		const edit = TextEdit.replace(range, `{${sep}${indent}${alphabetize(imports).join(`,${sep}${indent}`)}${sep}}`);
		edits.push(edit);
	}
	return edits;
}

function getImport(sourceFile: ts.SourceFile, moduleName: string): ImportLine {
	let importLine: ImportLine;

	function visit(node: ts.Node) {
		if (!importLine) {
			if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === moduleName) {
				if (!(node.importClause && node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings))) return;
				let imports;
				const start = ts.getLineAndCharacterOfPosition(sourceFile, node.importClause.pos + 1);
				const end = ts.getLineAndCharacterOfPosition(sourceFile, node.importClause.end);
				const range: Range = Range.create(start, end);
				const multiline = (start.line !== end.line);
				imports = node.importClause.namedBindings.elements;
				imports = imports.map(el => {
					if (el.propertyName && ts.isIdentifier(el.propertyName)) {
						return `${el.propertyName.text} as ${el.name.text}`;
					} else {
						return `${el.name.text}`;
					}
				});
				importLine = { range, multiline, imports };
			}
		}
		node.forEachChild(visit);
	}

	visit(sourceFile);
	return importLine;
}