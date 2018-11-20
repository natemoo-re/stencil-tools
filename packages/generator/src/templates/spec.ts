import { SpecOptions } from './declarations';
import { defaultFormat, createIndent, createQuote } from './shared';

const defaultOpts: SpecOptions = {
    tag: 'my-component',
    selector: 'my-component',
    className: 'MyComponent'
}

const spec = (opts?: Partial<SpecOptions> & { indent?: string, quotes?: string }) => {
    if (opts) {
        opts = { ...defaultFormat, ...defaultOpts, ...opts }
    } else {
        opts = { ...defaultFormat, ...defaultOpts }
    }
    const indent = createIndent(opts.indent);
    const quote = createQuote(opts.quotes);

    return `import { ${opts.className} } from ${quote(`./${opts.tag}`)};

describe(${quote(opts.selector)}, () => {
${indent(1)}it(${quote('builds')}, () => {
${indent(2)}expect(new ${opts.className}()).toBeTruthy();
${indent(1)}});
});
`;
}

export default spec;