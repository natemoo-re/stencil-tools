import * as ts from 'typescript';
import { CompletionItem, TextEdit, InsertTextFormat, CompletionItemKind, Position, TextDocumentIdentifier } from 'vscode-languageserver';
import { getAutoImportEdit, StencilImport } from './auto-import';
import { getDecoratorName, providePathCompletions } from './util';
import { DECORATORS, METHODS, LIFECYCLE_METHODS } from './component';
import { PROPS } from './router';
import { PREFIXES, KEYCODE_SUFFIX, isElementRefPrefix, DOM_EVENT_SUFFIX } from './listen';
import { SLOTS } from './elements';
import { DocumentMetadata } from '../metadata';

import { logger } from '../../../language-server';

class CompletionController {

	private COMPONENT: CompletionItem[] = [...DECORATORS, ...METHODS, ...LIFECYCLE_METHODS];
	private ELEMENTS: CompletionItem[] = [...SLOTS];
	private ROUTER: CompletionItem[] = [...PROPS];

	public getCompletions(textDocument: TextDocumentIdentifier, sourceFile: ts.SourceFile, position: Position, metadata: DocumentMetadata, checker: ts.TypeChecker, files: string[]) {
		const offset = sourceFile.getPositionOfLineAndCharacter(position.line, position.character);
		const container = this.getNodeContainingPosition(sourceFile, offset);

		if (!container) return [];

		const { componentMembers } = metadata;
		return this.getByNode(sourceFile, container, { componentMembers, checker, files })
			.map(this.addData({ textDocument, files }));
	}

	public resolveCompletions(item: CompletionItem, metadata: DocumentMetadata) {
		if (item.data.autoImport) item = this.resolveAutoImport(item, metadata);
		if (item.data.hasPlaceholders) item = this.resolvePlaceholders(item, metadata);
		return item;
	}

	/** Resolve additionalTextEdits for Decorators with AutoImport support */
	private resolveAutoImport(item: CompletionItem, metadata: DocumentMetadata) {
		const { stencilImport } = metadata;
		const additionalTextEdits = this.buildAdditionalTextEdits(stencilImport, item.data.autoImport);

		return Object.assign({}, item, { additionalTextEdits })
	}

	/** Do placeholder replacements based on Label name */
	private resolvePlaceholders(item: CompletionItem, metadata: DocumentMetadata) {
		switch (item.label) {
			case 'render':
				const { componentOptions } = metadata;
				item = this.replaceTemplate(item, { componentTag: componentOptions.value.tag });
				break;
			case 'Watch':
				const { props, states, watched } = metadata;
				let computedProps = [...props, ...states].filter(x => !watched.includes(x));
				if (!computedProps.length) computedProps = ['propName'];

				if (computedProps.length > 1) {
					item = this.replaceTemplate(item, { computedProps: `|${computedProps.join(',')}|` });
				} else if (computedProps.length === 1) {
					item = this.replaceTemplate(item, { computedProps: `:${computedProps[0]}` });
				}
				break;
			default: break;
		}
		return item;
	}

	private getNodeContainingPosition(sourceFile: ts.SourceFile, position: number) {
		let container: ts.Node;

		function visit(node: ts.Node) {
			if (node.pos < position && position < node.end) {
				node.parent = container;
				container = node;
				node.forEachChild(visit);
			}
		}

		sourceFile.forEachChild(visit);
		return container;
	}

	private getByDecorator(name: string): CompletionItem[] {
		const completions: CompletionItem[] = [];
		switch (name) {
			case '':
				break;
			default: break;
		}
		return completions;
	}

	private getByNode(sourceFile: ts.SourceFile, node: ts.Node, context: { componentMembers: string[], checker: ts.TypeChecker, files: string[] }): CompletionItem[] {
		const completions: CompletionItem[] = [];
		switch (node.kind) {
			case ts.SyntaxKind.ClassDeclaration: 
				completions.push(...this.COMPONENT.filter(this.filterUnused(context.componentMembers)));
				break;
			case ts.SyntaxKind.CallExpression:
				if (ts.isDecorator(node.parent)) {
					completions.push(...this.getByDecorator(getDecoratorName(node.parent)));
				}
				break;
			case ts.SyntaxKind.ObjectLiteralExpression:
				if (ts.isCallExpression(node.parent) && ts.isDecorator(node.parent.parent)) {
					completions.push(...this.getByDecorator(getDecoratorName(node.parent.parent)));
				}
				break;
			case ts.SyntaxKind.StringLiteral:
				if (ts.isCallExpression(node.parent) && ts.isDecorator(node.parent.parent)) {
					const decorator = getDecoratorName(node.parent.parent);
					const current = (node as ts.StringLiteral).text;

					if (decorator === 'Listen') {
						if (!current.trim()) {
							completions.push(...PREFIXES.map(x => ({ label: x, kind: CompletionItemKind.Enum })))
						}
						if (current === 'keydown.') {
							completions.push(...KEYCODE_SUFFIX.map(x => ({ label: x, kind: CompletionItemKind.EnumMember })))
						} else if (isElementRefPrefix(current)) {
							completions.push(...DOM_EVENT_SUFFIX.map(x => ({ label: x, kind: CompletionItemKind.EnumMember })));
						}
					}
				} else {
					
					// TODO: this could be cleaned up a lot...

					const parent = node.parent;
					let assignment: ts.PropertyAssignment;
					let container: ts.CallExpression;

					if (ts.isPropertyAssignment(parent)) {
						assignment = parent;
						if (ts.isCallExpression(parent.parent.parent)) {
							container = parent.parent.parent
						} else if (ts.isPropertyAssignment(parent.parent.parent)) {
							assignment = parent.parent.parent; 
							container = assignment.parent.parent as ts.CallExpression;
						}
					} else if (ts.isArrayLiteralExpression(parent)) {
						assignment = parent.parent && ts.isPropertyAssignment(parent.parent) && parent.parent;
						container = parent.parent.parent.parent && ts.isCallExpression(parent.parent.parent.parent) && parent.parent.parent.parent;
					}
					
					if (container && ts.isDecorator(container.parent)) {
						const property = ts.isIdentifier(assignment.name) && assignment.name.text;
						// TODO Make sure we're actually in the Component decorator?
						// const decorator = ts.isIdentifier(container.parent.expression) && container.parent.expression.text;

						// This is the fun part
						if (/styleUrls?/gm.test(property)) {
							completions.push(...providePathCompletions({ uri: sourceFile.fileName }, context.files, {
								relativeTo: ts.isStringLiteral(node) && node.text,
								includeDirs: true,
								includeFiles: true,
								pattern: ['**/*.css', '**/*.s{c,a}ss', '**/*.styl{us,}', '**/*.pcss', '!**/*.vars.*']
							}))
						} else if (/assetsDirs?/gm.test(property)) {
							completions.push(...providePathCompletions({ uri: sourceFile.fileName }, context.files, {
								relativeTo: ts.isStringLiteral(node) && node.text,
								includeDirs: true,
								includeFiles: false
							}))
						}
					}

				}
				break;
			case ts.SyntaxKind.JsxElement:
			case ts.SyntaxKind.JsxText:
				completions.push(...this.ELEMENTS);
				
				const ambient = context.checker.getAmbientModules();
				// const intrinsicTagNames = context.checker.getJsxIntrinsicTagNamesAt(sourceFile);
				logger.info(ambient.map(x => x.name));
				// logger.info(intrinsicTagNames.map(x => x.name));

				// completions.push(...['app-root', 'app-profile', 'app-home'].map(tag => ({ label: tag, insertText: `<${tag}>$0</${tag}>`, insertTextFormat: InsertTextFormat.Snippet })));
				break;
			default:
				const kind = ts.SyntaxKind[node.kind];
				break;
		}
		return completions;
	}

	private buildAdditionalTextEdits(stencilImport: StencilImport, insertText: string): TextEdit[] {
		return getAutoImportEdit(stencilImport, insertText);
	}

	private filterUnused(used: string[]) {
		return (completion: CompletionItem) => {
			if (completion.data && completion.data.isFilterable) return !used.includes(completion.label);
			else return true;
		}
	}

	private addData(additionalData: { [key: string]: any }) {
		return (completion: CompletionItem) => {
			completion.data = Object.assign({}, completion.data, additionalData);
			return completion;
		}
	}

	private buildRegex(name: string) {
		return new RegExp(`\\%${name}\\%`, 'gm');
	}

	private replaceTemplate(item: CompletionItem, data: { [key: string]: string }) {
		let { insertText, documentation } = item;
		for (let [key, value] of Object.entries(data)) {
			const pattern = this.buildRegex(key);
			if (typeof value === 'string') {
				insertText = insertText.replace(pattern, value);
				if (typeof documentation === 'string') {
					documentation = documentation.replace(pattern, value);
				} else {
					documentation = { kind: documentation.kind, value: documentation.value.replace(pattern, value) }
				}
			}
		}
		return Object.assign({}, item, { insertText, documentation });
	}

}

export const CompletionService = new CompletionController();