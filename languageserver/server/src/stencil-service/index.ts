import { TextDocumentIdentifier, Position, CompletionItem, Diagnostic, DocumentLink, DidChangeWatchedFilesParams } from "vscode-languageserver";
import { ProjectManager } from '../project-manager';
import { CompletionService } from './features/completions';
import { DocumentLinksService } from './features/document-links';
import { DiagnosticsService } from './features/diagnostics';
import { MetadataService } from './features/metadata';
import { WatchService } from './features/watcher';

export class StencilService {
	
	private metadata: MetadataService;
	private watcher: WatchService;
	
	constructor(private projectManager: ProjectManager) {
		this.metadata = new MetadataService(projectManager);
		this.watcher = new WatchService(projectManager);
	}
	
	public debugSourceFileContents(textDocument: TextDocumentIdentifier) {
		return this.projectManager.getSourceFile(textDocument).text;
	}
	
	getCompletionItems(textDocument: TextDocumentIdentifier, position: Position, data?: { files: string[] }): CompletionItem[] {
		const sourceFile = this.projectManager.getSourceFile(textDocument);
		const metadata = this.metadata.get(textDocument);
		const checker = this.projectManager.getTypeChecker();
		const files = data ? data.files : [];
		return CompletionService.getCompletions(textDocument, sourceFile, position, metadata, checker, files);
	}

	resolveCompletionItem(item: CompletionItem): CompletionItem {
		if (item.data && item.data.resolve) {
			const { uri } = item.data.textDocument;
			const metadata = this.metadata.get({ uri });
			return CompletionService.resolveCompletions(item, metadata);
		}
		
		return item;
	}

	async getDocumentLinks({ uri }: TextDocumentIdentifier): Promise<DocumentLink[]> {
		const document = this.projectManager.getDocument({ uri });
		const sourceFile = this.projectManager.getSourceFile({ uri });
		const metadata = this.metadata.get({ uri });
		const diagnostics = await this.getDiagnostics({ uri });

		return DocumentLinksService.resolveLinks(document, sourceFile, metadata, diagnostics);
	}

	async getDiagnostics({ uri }: TextDocumentIdentifier): Promise<Diagnostic[]> {
		const document = this.projectManager.getDocument({ uri });
		const metadata = this.metadata.get({ uri });
		
		const d = DiagnosticsService.resolveDiagnostics(document, metadata);
		this.projectManager.setDiagnostics(d);
		
		return d;
	}

	setFiles(files: string[]) {
		return this.watcher.reset(files);
	}

	updateFiles({ changes }: DidChangeWatchedFilesParams) {
		return this.watcher.update({ changes });
	}

}