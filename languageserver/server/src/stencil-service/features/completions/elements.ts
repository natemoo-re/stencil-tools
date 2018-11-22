import { CompletionItem, MarkupKind, InsertTextFormat, CompletionItemKind } from 'vscode-languageserver';
import { flatten } from './util';

export const SLOTS: CompletionItem[] = [
    {
        label: '',
        detail: 'Slot',
        insertText: '<slot />$0',
        preview: "<slot />"
    },
    {
        label: '-name',
        detail: 'Slot (Named)',
        insertText: '<slot name="${1:value}" />$0',
        preview: '<slot name="value" />'
    }
].map((item) => {
    return {
        label: `slot${item.label}`,
        detail: item.detail,
        kind: CompletionItemKind.Property,
        documentation: {
            kind: MarkupKind.Markdown,
            value: `\`\`\`tsx
${flatten(item.preview)}
\`\`\``
        },
        insertText: flatten(item.insertText),
        insertTextFormat: InsertTextFormat.Snippet,
        data: {
            resolve: false,
            isFilterable: false
        }
    }
});