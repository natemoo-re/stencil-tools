import * as path from 'path';
import * as ts from 'typescript';
import { DocumentLink, Range, TextDocument, Diagnostic } from 'vscode-languageserver';
import { DocumentMetadata } from './metadata';
import { logger } from '../../language-server';

class DocumentLinksController {
    
    public resolveLinks(document: TextDocument, sourceFile: ts.SourceFile, metadata: DocumentMetadata, diagnostics: Diagnostic[]): DocumentLink[] {
        const { links } = metadata;
        let documentLinks: DocumentLink[] = [];

        for (let link of links) {
            const text = link.getText(sourceFile);
            const start = document.positionAt(link.getStart(sourceFile) + 1);
            const end = document.positionAt(link.getEnd() - 1);
            documentLinks.push(DocumentLink.create({ start, end }, this.getLinkTarget(document, text)));
        }

        return documentLinks;
    }

    private getLinkTarget(document: TextDocument, link: string) {
        return path.join(path.dirname(document.uri), link.slice(1, link.length - 1));
    }

    private dedupe(arr: string[]): string[] {
        return Array.from(new Set(arr));
    }
}

export const DocumentLinksService = new DocumentLinksController();