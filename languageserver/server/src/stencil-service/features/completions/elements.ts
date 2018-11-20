import { CompletionItem, MarkupKind, InsertTextFormat, CompletionItemKind } from 'vscode-languageserver';
import { flatten } from './util';

export const ELEMENTS: CompletionItem[] = [
    {
        label: 'Named',
        insertText: `<slot name="{$1:name}"></slot>`,
        description: '',
        preview: "@Prop() match!: MatchResults;"
    }
].map((item) => {
    return {
        label: item.label,
        detail: `Slot: \n${item.label}`,
        kind: CompletionItemKind.Snippet,
        documentation: {
            kind: MarkupKind.Markdown,
            value: flatten(item.description)
        },
        insertText: flatten(item.insertText),
        insertTextFormat: InsertTextFormat.Snippet,
        data: {
            resolve: false,
            isFilterable: true
        }
    }
});