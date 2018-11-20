import * as path from 'path';
import { DocumentLink, Range, TextDocument } from 'vscode-languageserver';
import { DocumentMetadata } from './metadata';

class DocumentLinksController {
    
    public resolveLinks(document: TextDocument, metadata: DocumentMetadata): DocumentLink[] {
        const potentialLinks = this.findPotentialLinks(metadata);
        if (potentialLinks.length < 1) {
            return [];
        }

        const links = potentialLinks.map(link => ({ text: link, range: this.getLinkRange(document, metadata, link) }));
        return links.map(link => DocumentLink.create(link.range, this.getLinkPath(document, link.text)));
    }

    private findPotentialLinks(metadata: DocumentMetadata) {
        let collected: string[] = [];
        const defaultComponentOptions: any = {
            styleUrl: null,
            styleUrls: [],
            assetsDir: null,
            assetsDirs: []
        }
        const { componentOptions: { value: { styleUrl, styleUrls, assetsDir, assetsDirs } } } = metadata;
        const options = Object.assign({}, defaultComponentOptions, { styleUrl, styleUrls, assetsDir, assetsDirs });

        for (let value of Object.values(options)) {
            if (value) {
                if (Array.isArray(value)) collected.push(...value);
                if (typeof value === 'string') collected.push(value);
                if (typeof value === 'object') collected.push(...Object.values(value));
            }
        }

        return this.dedupe(collected);
    }

    private _text = new Map<string, string>();
    private _versions = new Map<string, number>();
    private getLinkRange(document: TextDocument, metadata: DocumentMetadata, link: string): Range {
        let text: string;
        if (this._versions.get(document.uri) === document.version) {
            text = this._text.get(document.uri);
        } else {
            const lines = document.getText().split('\n');
            const { componentOptions: { range } } = metadata;

            const textRange = [...lines].slice(range.start.line, range.end.line);
            textRange[0] = textRange[0].slice(range.start.character);
            textRange[textRange.length - 1] = textRange[textRange.length - 1].slice(0, range.end.character);
            
            text = textRange.join('\n');
            this._text.set(document.uri, text);
            this._versions.set(document.uri, document.version);
        }

        let line: number;
        let character: number;

        for (let [key, ln] of Object.entries(text.split('\n'))) {
            const pattern = new RegExp(`\\b${link}\\b`, 'gm')
            const match = pattern.test(ln)
            if (match) {
                line = Number.parseInt(key);
                character = ln.search(pattern) - 1;
            }
        }
        
        return { start: { line, character }, end: { line, character: character + link.length + 2 } };
    }

    private getLinkPath(document: TextDocument, linkText: string) {
        return path.join(path.dirname(document.uri), linkText);
    }

    private dedupe(arr: string[]): string[] {
        return Array.from(new Set(arr));
    }
}

export const DocumentLinksService = new DocumentLinksController();