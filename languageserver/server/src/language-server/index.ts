import { Connection, InitializeParams, InitializeResult, TextDocumentSyncKind, DidChangeConfigurationNotification, CompletionParams, InitializedParams, CompletionItem, TextDocumentIdentifier, DocumentLinkParams, DidOpenTextDocumentParams, ServerCapabilities, FileChangeType, DidChangeWatchedFilesParams, DidCloseTextDocumentParams, DocumentLink, TextDocumentChangeEvent, DidChangeTextDocumentParams } from 'vscode-languageserver';

import { CAPABILITY } from './capabilities';

import { ProjectManager } from '../project-manager';
import { StencilService } from '../stencil-service';
import { Logger } from './logger';

let logger: Logger;
export class StencilLanguageServer {
	
	/** 
	 * Represents the server connection to the client
	 */
	connection: Connection;
	/** 
	 * Manages textDocuments and configurations, including caching and versioning
	 */
	projectManager: ProjectManager;
	/** 
	 * Handles Stencil-related operations such as completions, diagnostics, etc
	 */
	service: StencilService;

	constructor(connection: any) {
		this.connection = connection;
		logger = new Logger(connection);

		this.projectManager = new ProjectManager();
		this.service = this.projectManager.getStencilService();

		this.bindHandlers();
		this.listen();
	}
	
	/**
	 * Bind each of the LanguageServer's handlers to the corresponding connection handler
	 */
	private bindHandlers(): void {
		this.connection.onInitialize(handler => this.onInitialize(handler));
		this.connection.onInitialized(handler => this.onInitialized(handler));
		this.connection.onCompletion(handler => this.onCompletion(handler));
		this.connection.onCompletionResolve(handler => this.onCompletionResolve(handler));
		this.connection.onDocumentLinks(handler => this.onDocumentLinks(handler));
		this.connection.onDidOpenTextDocument(handler => this.onDidOpenTextDocument(handler));
		this.connection.onDidChangeTextDocument(handler => this.onDidChangeTextDocument(handler));
		this.connection.onDidChangeWatchedFiles(handler => this.onDidChangeWatchedFiles(handler));
	}

	/** 
	 * Kicks off listen processes for dependencies that require it
	 */
	private listen() {
		this.projectManager.listen(this.connection);
		this.connection.listen();
	}

	// ------–------–------–------ INITIALIZATION ------–------–------–------
	/** 
	 * Stores client capabilities on initialization
	 */
	private capabilities = new Map<CAPABILITY, boolean>();
	/** 
	 * Checks whether capability exists and is supported
	 */
	private isCapable(capability: CAPABILITY): boolean {
		return this.capabilities.has(capability) && this.capabilities.get(capability);
	}

	onInitialize({ capabilities }: InitializeParams): InitializeResult {
		this.capabilities.set(CAPABILITY.CONFIGURATION, capabilities.workspace && !!capabilities.workspace.configuration);
		this.capabilities.set(CAPABILITY.WORKSPACE_FOLDER, capabilities.workspace && !!capabilities.workspace.workspaceFolders);
		this.capabilities.set(CAPABILITY.DIAGNOSTIC_RELATED_INFORMATION, capabilities.textDocument && capabilities.textDocument.publishDiagnostics && capabilities.textDocument.publishDiagnostics.relatedInformation);
		this.capabilities.set(CAPABILITY.DOCUMENT_LINKS, capabilities.textDocument && capabilities.textDocument.documentLink && capabilities.textDocument.documentLink.dynamicRegistration);
		this.capabilities.set(CAPABILITY.X_FILES, true);

		const initializeResult: InitializeResult & { capabilities: ServerCapabilities & { xfilesProvider: boolean } } = {
			capabilities: {
				textDocumentSync: TextDocumentSyncKind.Full,
				completionProvider: {
					resolveProvider: true,
					triggerCharacters: ['"', "'", '/', ':', '.']
				},
				documentLinkProvider: {
					resolveProvider: true
				},
				workspace: {
					workspaceFolders: {
						changeNotifications: true
					}
				},
				xfilesProvider: true
			}
		}

		return initializeResult;
	};

	async onInitialized(_: InitializedParams): Promise<void> {
		this.connection.console.log('StencilLanguageServer Initialized');
		
		if (this.isCapable(CAPABILITY.CONFIGURATION)) {
			this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
		}
		
		if (this.isCapable(CAPABILITY.WORKSPACE_FOLDER)) {
			this.connection.workspace.onDidChangeWorkspaceFolders((_event) => {
				logger.info('Workspace folder change event received.');
			})
		}

		if (this.isCapable(CAPABILITY.X_FILES)) {
			this.onXfiles();
		}

	}

	onCompletion({ textDocument, position }: CompletionParams) {
		return this.service.getCompletionItems(textDocument, position, { files: this.projectManager.getFiles() });
	}

	onCompletionResolve(item: CompletionItem): CompletionItem {
		return this.service.resolveCompletionItem(item);
	}

	async onDocumentLinks({ textDocument }: DocumentLinkParams) {
		return (this.isCapable(CAPABILITY.DOCUMENT_LINKS)) ? this.service.getDocumentLinks(textDocument) : Promise.resolve([] as DocumentLink[]);
	}

	async onDidChangeTextDocument({ textDocument }: DidChangeTextDocumentParams) {
		const diagnostics = await this.service.getDiagnostics(textDocument);
		this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
	}

	onDidOpenTextDocument({ textDocument }: DidOpenTextDocumentParams) {
		this.projectManager.getSourceFile(textDocument);
	}

	/** 
	 * Folder removal doesn't send file DELETE events...
	 * To make sure things are N*SYNC, we'll need a sanity check
	 * before making use of the File State we're priming here
	 * https://github.com/Microsoft/vscode-languageserver-node/issues/141
	 */
	onDidChangeWatchedFiles({ changes }: DidChangeWatchedFilesParams) {
		this.service.updateFiles({ changes });
	}

	async onXfiles() {
		const files = await this.connection.sendRequest('workspace/xfiles');
		if (files && Array.isArray(files)) {
			this.service.setFiles(files.map(file => `${file.scheme}://${file.path}` ))
		}
	}

}

export { logger };