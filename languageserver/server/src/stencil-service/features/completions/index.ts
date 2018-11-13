import * as ts from 'typescript';
import { CompletionItem, TextEdit, InsertTextFormat, CompletionItemKind } from 'vscode-languageserver';
import { getAutoImportEdit, StencilImport } from './auto-import';
import { getDecoratorName } from './util';
import { DECORATORS, METHODS, LIFECYCLE_METHODS } from './component';
import { PREFIXES, KEYCODE_SUFFIX, isElementRefPrefix, DOM_EVENT_SUFFIX } from './listen';

class CompletionController {

	private COMPONENT: CompletionItem[] = [...DECORATORS, ...METHODS, ...LIFECYCLE_METHODS];

	getNodeContainingPosition(sourceFile: ts.SourceFile, position: number) {
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

	getByNode(node: ts.Node, context: { componentMembers: string[], checker: ts.TypeChecker }): CompletionItem[] {
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
				// const ambient = context.checker.getAmbientModules();
				// console.log(intrinsicTagNames);
				completions.push(...['app-root', 'app-profile', 'app-home'].map(tag => ({ label: tag, insertText: `<${tag}>$0</${tag}>`, insertTextFormat: InsertTextFormat.Snippet })));
				break;
			default:
				const kind = ts.SyntaxKind[node.kind];
				break;
		}
		return completions;
	}

	public buildAdditionalTextEdits(stencilImport: StencilImport, insertText: string): TextEdit[] {
		return getAutoImportEdit(stencilImport, insertText);
	}

	private filterUnused(used: string[]) {
		return (completion: CompletionItem) => {
			if (completion.data && completion.data.isFilterable) return !used.includes(completion.label);
			else return true;
		}
	}

	public addData(additionalData: { [key: string]: any }) {
		return (completion: CompletionItem) => {
			completion.data = Object.assign({}, completion.data, additionalData);
			return completion;
		}
	}

}

export const CompletionService = new CompletionController();