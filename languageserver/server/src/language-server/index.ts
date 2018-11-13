import {
	Connection, InitializeParams, InitializeResult, TextDocumentSyncKind, DidChangeConfigurationNotification, CompletionParams, InitializedParams, CompletionItem, TextDocumentIdentifier, DocumentLinkParams, TextDocumentPositionParams, DidOpenTextDocumentParams, ServerCapabilities
} from 'vscode-languageserver';

import { CAPABILITY } from './capabilities';

import { ProjectManager } from '../project-manager';
import { StencilService } from '../stencil-service';

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
	private hasCapability(capability: CAPABILITY): boolean {
		return this.capabilities.has(capability) && this.capabilities.get(capability);
	}

	onInitialize({ capabilities }: InitializeParams): InitializeResult {
		this.capabilities.set(CAPABILITY.CONFIGURATION, capabilities.workspace && !!capabilities.workspace.configuration);
		this.capabilities.set(CAPABILITY.WORKSPACE_FOLDER, capabilities.workspace && !!capabilities.workspace.workspaceFolders);
		this.capabilities.set(CAPABILITY.DIAGNOSTIC_RELATED_INFORMATION, capabilities.textDocument && capabilities.textDocument.publishDiagnostics && capabilities.textDocument.publishDiagnostics.relatedInformation);
		this.capabilities.set(CAPABILITY.DOCUMENT_LINKS, capabilities.textDocument && capabilities.textDocument.documentLink && capabilities.textDocument.documentLink.dynamicRegistration);

		const initializeResult: InitializeResult & { capabilities: ServerCapabilities & { xfilesProvider: boolean } } = {
			capabilities: {
				textDocumentSync: TextDocumentSyncKind.Full,
				completionProvider: {
					resolveProvider: true,
					triggerCharacters: ['"', "'", '/', ':', '.', '@']
				},
				documentLinkProvider: {
					resolveProvider: true
				},
				xfilesProvider: true
			}
		}

		return initializeResult;
	};

	onInitialized(_: InitializedParams): void {
		this.connection.console.log('StencilLanguageServer Initialized.');
		if (this.hasCapability(CAPABILITY.CONFIGURATION)) {
			this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
		}
		
		if (this.hasCapability(CAPABILITY.WORKSPACE_FOLDER)) {
			this.connection.workspace.onDidChangeWorkspaceFolders((_event) => {
				// connection.console.log('Workspace folder change event received.');
			})
		}

		this.connection.sendRequest('workspace/xfiles').then((response) => {
			this.connection.console.log(`workspace/xfiles request recieved with response ${JSON.stringify(response, null, 2)}`);
		})
	}

	onCompletion({ textDocument, position }: CompletionParams) {
		return this.service.getCompletionItems(textDocument, position);
	}

	onCompletionResolve(item: CompletionItem): CompletionItem {
		return this.service.resolveCompletionItem(item);
	}

	onDocumentLinks({ textDocument }: DocumentLinkParams) {
		return (this.hasCapability(CAPABILITY.DOCUMENT_LINKS)) ? this.service.getDocumentLinks(textDocument) : null;
	}

	onDocumentChange(textDocument: TextDocumentIdentifier) {
		const diagnostics = this.service.getDiagnostics(textDocument);
		this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
	}

	onDidOpenTextDocument({ textDocument }: DidOpenTextDocumentParams) {
		this.projectManager.getSourceFile(textDocument);
	}

	onXfiles() {
		this.connection.sendRequest('workspace/xfiles').then(response => {
			this.connection.console.log('workspace/xfiles response success');
		})
	}

	

}