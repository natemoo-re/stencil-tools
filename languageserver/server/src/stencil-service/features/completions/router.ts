import { CompletionItem, MarkupKind, InsertTextFormat, CompletionItemKind } from 'vscode-languageserver';
import { flatten } from './util';

export const PROPS: CompletionItem[] = [
    {
        label: 'match',
        description: [
            "The component is about to load and it has not rendered yet.\n",
            "This is the best place to make any data updates before the first render.\n",
            "`componentWillLoad` will only be called once."
        ],
        insertText: "@Prop() ${1:match}!: MatchResults;",
        preview: "@Prop() match!: MatchResults;",
        autoImport: 'Prop'
    }
].map((item) => {
    return {
        label: item.label,
        detail: `Stencil Router: \n${item.label}`,
        kind: CompletionItemKind.Function,
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