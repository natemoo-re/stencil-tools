import * as ts from 'typescript';
import { CompletionItem, TextEdit, InsertTextFormat, CompletionItemKind, Position, TextDocumentIdentifier } from 'vscode-languageserver';
import { getAutoImportEdit, StencilImport } from './auto-import';
import { getDecoratorName } from './util';
import { DECORATORS, METHODS, LIFECYCLE_METHODS } from './component';
import { PROPS } from './router';
import { PREFIXES, KEYCODE_SUFFIX, isElementRefPrefix, DOM_EVENT_SUFFIX } from './listen';
import { ELEMENTS } from './elements';
import { DocumentMetadata } from '../metadata';

class CompletionController {

	private COMPONENT: CompletionItem[] = [...DECORATORS, ...METHODS, ...LIFECYCLE_METHODS];
	private ELEMENTS: CompletionItem[] = [...ELEMENTS];
	private ROUTER: CompletionItem[] = [...PROPS];

	public getCompletions(textDocument: TextDocumentIdentifier, sourceFile: ts.SourceFile, position: Position, metadata: DocumentMetadata, checker: any) {
		const offset = sourceFile.getPositionOfLineAndCharacter(position.line, position.character);
		const container = this.getNodeContainingPosition(sourceFile, offset);

		if (!container) return [];

		const { componentMembers } = metadata;
		return CompletionService.getByNode(container, { componentMembers, checker })
			.map(CompletionService.addData({ textDocument }));
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

	private getByNode(node: ts.Node, context: { componentMembers: string[], checker: ts.TypeChecker }): CompletionItem[] {
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
					console.log(decorator, current);
				}
				break;
			case ts.SyntaxKind.JsxElement:
			case ts.SyntaxKind.JsxText:
				console.log(node);
				const ambient = context.checker.getAmbientModules();
				// ambient.find((x) => )
				// console.log(intrinsicTagNames);
				completions.push(...['app-root', 'app-profile', 'app-home'].map(tag => ({ label: tag, insertText: `<${tag}>$0</${tag}>`, insertTextFormat: InsertTextFormat.Snippet })));
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