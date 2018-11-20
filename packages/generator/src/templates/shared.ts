export const defaultFormat = {
    indent: '  ',
    quotes: `'`
}

export const createIndent = (indent: string) => (n: number = 1) => indent.repeat(n);
export const createQuote = (quote: string) => (text: string) => `${quote}${text}${quote}`;