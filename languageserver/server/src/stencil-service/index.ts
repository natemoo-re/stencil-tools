import { TextDocumentIdentifier, Position, CompletionItem, Diagnostic, DocumentLink, Hover } from "vscode-languageserver";
import { ProjectManager } from '../project-manager';
import * as ts from 'typescript';

import { CompletionCtrl } from './features/completions';
import { MetadataService } from './features/metadata';

export class StencilService {
	
	private metadata: MetadataService;
	constructor(private projectManager: ProjectManager) {
		console.log('Initializing StencilService');
		this.metadata = new MetadataService(projectManager);
	}

	private _getMetadata({ uri }: TextDocumentIdentifier) {
		return this.metadata.get({ uri });
	}

	public debugSourceFileContents(textDocument: TextDocumentIdentifier) {
		return this.projectManager.getSourceFile(textDocument).text;
	}
	
	getCompletionItems(textDocument: TextDocumentIdentifier, position: Position): CompletionItem[] {
		const sourceFile = this.projectManager.getSourceFile(textDocument);
		const offset = sourceFile.getPositionOfLineAndCharacter(position.line, position.character);
		const container = CompletionCtrl.getNodeContainingPosition(sourceFile, offset);

		if (!container) return [];
		
		const { componentMembers } = this._getMetadata(textDocument);
		const checker = this.projectManager.getTypeChecker();

		return CompletionCtrl.getByNode(container, { componentMembers, checker })
			.map(CompletionCtrl.addData({ textDocument }));
	}

	resolveCompletionItem(item: CompletionItem): CompletionItem {
		if (item.data && item.data.resolve) {
			// Resolve additionalTextEdits for Decorators with AutoImport support
			if (item.data.autoImport) {
				const { stencilImport } = this._getMetadata({ uri: item.data.textDocument.uri });
				const additionalTextEdits = CompletionCtrl.buildAdditionalTextEdits(stencilImport, item.data.autoImport);
				
				item = Object.assign({}, item, { additionalTextEdits })
			}
			
			// Do placeholder replacements based on Label name
			switch (item.label) {
				case 'render':
					const { componentOptions } = this._getMetadata(item.data.textDocument.uri);
					item.insertText = item.insertText.replace(/{{componentTag}}/g, componentOptions.tag);
					break;
				case 'Watch':
					console.log(item);
					const { props, states, watched } = this._getMetadata(item.data.textDocument.uri);
					let computedProps = [...props, ...states].filter(x => !watched.includes(x));
					if (!computedProps) computedProps = ['propName'];

					if (computedProps.length > 1) {
						item.insertText = item.insertText.replace('{{computedProps}}', `|${computedProps.join(',')}|`);
					} else if (computedProps.length === 1) {
						item.insertText = item.insertText.replace('{{computedProps}}', `:${computedProps[0]}`);
					}
					break;
				default: break;
			}
		}

		return item;
	}

	getDocumentLinks(textDocument: TextDocumentIdentifier): DocumentLink[] {
		return [];
	}

	getDiagnostics(textDocument: TextDocumentIdentifier): Diagnostic[] {
		return [];
	}

}