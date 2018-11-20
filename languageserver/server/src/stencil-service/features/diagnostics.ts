import * as path from 'path';
import { DocumentMetadata } from './metadata';
import { TextDocument, Diagnostic } from 'vscode-languageserver';

class DiagnosticsController {

    public resolveDiagnostics(document: TextDocument, metadata: DocumentMetadata): Diagnostic[] {
        if (this.cached(document)) return this.cache.get(document.uri);
        return this.getDiagnostics(document, metadata);
    }

    private getDiagnostics(document: TextDocument, metadata: DocumentMetadata): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];

        this.setCache(document, diagnostics);
        return diagnostics;
    }

    private cache = new Map<string, Diagnostic[]>();
    private versions = new Map<string, number>();

    private cached(document: TextDocument) {
        const version = this.versions.get(document.uri);
        return (version !== undefined && version === document.version);
    }

    private setCache(document: TextDocument, diagnostics: Diagnostic[]) {
        this.cache.set(document.uri, diagnostics);
        this.versions.set(document.uri, document.version);
    }
}

export const DiagnosticsService = new DiagnosticsController();