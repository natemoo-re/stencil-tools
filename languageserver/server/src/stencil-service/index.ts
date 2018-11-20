import { TextDocumentIdentifier, Position, CompletionItem, Diagnostic, DocumentLink, Hover, Range } from "vscode-languageserver";
import { ProjectManager } from '../project-manager';
import { CompletionService } from './features/completions';
import { DocumentLinksService } from './features/document-links';
import { DiagnosticsService } from './features/diagnostics';
import { MetadataService } from './features/metadata';

export class StencilService {
	
	private metadata: MetadataService;
	
	constructor(private projectManager: ProjectManager) {
		this.metadata = new MetadataService(projectManager);
	}
	
	public debugSourceFileContents(textDocument: TextDocumentIdentifier) {
		return this.projectManager.getSourceFile(textDocument).text;
	}
	
	getCompletionItems(textDocument: TextDocumentIdentifier, position: Position): CompletionItem[] {
		const sourceFile = this.projectManager.getSourceFile(textDocument);
		const metadata = this.metadata.get(textDocument);
		const checker = this.projectManager.getTypeChecker();
		return CompletionService.getCompletions(textDocument, sourceFile, position, metadata, checker);
	}

	resolveCompletionItem(item: CompletionItem): CompletionItem {
		if (item.data && item.data.resolve) {
			const { uri } = item.data.textDocument;
			const metadata = this.metadata.get({ uri });
			return CompletionService.resolveCompletions(item, metadata);
		}
		
		return item;
	}

	getDocumentLinks({ uri }: TextDocumentIdentifier): DocumentLink[] {
		const document = this.projectManager.getDocument({ uri });
		const metadata = this.metadata.get({ uri });
		
		return DocumentLinksService.resolveLinks(document, metadata);
	}

	getDiagnostics({ uri }: TextDocumentIdentifier): Diagnostic[] {
		const document = this.projectManager.getDocument({ uri });
		const metadata = this.metadata.get({ uri });
		return DiagnosticsService.resolveDiagnostics(document, metadata);
	}

}