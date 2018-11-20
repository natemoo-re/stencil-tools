import * as ts from "typescript";
import { IConnection, TextDocuments, TextDocumentIdentifier } from 'vscode-languageserver';
import { StencilService } from "../stencil-service";
import { URItoName } from '../util'; 


export class ProjectManager {

	private ts: ts.Program;
	private host: ts.CompilerHost;
	
	private documents: TextDocuments;
	
	public getDocument({ uri }: TextDocumentIdentifier) {
		return this.documents.get(uri);
	}

	constructor() {
		this.documents = new TextDocuments();
		this.documents.onDidChangeContent((documents) => {
			documents.document.version
		})
		this.service = new StencilService(this);
		this.host = ts.createCompilerHost({ target: ts.ScriptTarget.ES2017 });
		this.createProgram([]);
	}

	private createProgram(newSourceFiles: string | string[]) {
		if (!Array.isArray(newSourceFiles)) { newSourceFiles = [newSourceFiles]; }
		if (this.ts) {
			const existingSourceFiles = this.ts.getSourceFiles();
			this.ts = ts.createProgram([...existingSourceFiles.map(v => v.fileName), ...newSourceFiles], { target: ts.ScriptTarget.ES2017 }, this.host, this.ts);
		} else {
			this.ts = ts.createProgram([...newSourceFiles], { target: ts.ScriptTarget.ES2017 }, this.host);
		}
	}
	public getProgram(): ts.Program {
		return this.ts;
	}

	private service: StencilService;
	
	public getStencilService() {
		return this.service;
	}

	public getSourceFile(textDocument: TextDocumentIdentifier): ts.SourceFile {
		const name = URItoName(textDocument.uri);
		const document = this.getDocument(textDocument);
		const newSourceFile = ts.createSourceFile(name, document.getText(), ts.ScriptTarget.ES2017);
		this.createProgram(name);
		
		return newSourceFile;
	}
	
	public getSourceFiles(): ReadonlyArray<ts.SourceFile> {
		return this.ts.getSourceFiles();
	}

	public getTypeChecker() {
		if (!this.ts) {
			throw new Error('Unable to get TypeChecker because Program has not been initialized');
		}
		return this.ts.getTypeChecker();
	}

	/** 
	 * Listens to low-level notifications from the connection
	*/
	listen(connection: IConnection): void {
		this.documents.listen(connection);

		this.documents.onDidOpen(() => {
			connection.console.log(JSON.stringify(this.getSourceFiles().map(file => file.fileName), null, 2));
		})
	}
}
