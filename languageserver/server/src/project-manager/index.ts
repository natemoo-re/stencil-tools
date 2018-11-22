import * as ts from "typescript";
import { IConnection, TextDocuments, TextDocumentIdentifier, Diagnostic } from 'vscode-languageserver';
import { StencilService } from "../stencil-service";
import { URItoName } from '../util'; 
import { logger } from "../language-server";


export class ProjectManager {

	private ts: ts.Program;
	private host: ts.CompilerHost;
	
	private documents: TextDocuments;
	private files: string[] = [];
	private diagnostics: Diagnostic[] = [];
	
	public getDocument({ uri }: TextDocumentIdentifier) {
		return this.documents.get(uri);
	}

	constructor() {
		this.documents = new TextDocuments();
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
		if (document) {
			const newSourceFile = ts.createSourceFile(name, document.getText(), ts.ScriptTarget.ES2017);
			this.createProgram(name);
			
			return newSourceFile;
		}
		return null;
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

	public pendingDiagnostics: Promise<void> = new Promise(() => { });

	public setDiagnostics(diagnostics: Diagnostic[]) {
		this.diagnostics = diagnostics;
	}

	public getDiagnostics(): Diagnostic[] {
		return this.diagnostics;
	}

	public setFiles(files: string[]) {
		this.files = files.map(uri => URItoName(uri));
		// const tsFiles = files.filter(f => f.endsWith('ts') || f.endsWith('tsx'));
		// for (let uri of tsFiles) {
			// this.getSourceFile({ uri });
		// }
	}

	public getFiles(): string[] {
		if (this.files.length) return this.files;
		return [];
	}

	public addFile(uri: string) {
		let name = URItoName(uri);
		if (this.files.indexOf(name) > -1) return;
		this.files = [...this.files, name];
	}
	
	public removeFile(uri: string) {
		let name = URItoName(uri);
		if (!(this.files.indexOf(name) >= 0)) return;
		this.files = this.files.filter(file => file !== name);
	}

	/** 
	 * Listens to low-level notifications from the connection
	*/
	listen(connection: IConnection): void {
		this.documents.listen(connection);
	}
}
