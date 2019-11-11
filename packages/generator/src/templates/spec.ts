import { SpecOptions } from './declarations';
import { defaultFormat, createIndent, createQuote } from './shared';

const defaultOpts: SpecOptions = {
	tag: 'my-component',
	selector: 'my-component',
	className: 'MyComponent'
};

const spec = (opts?: Partial<SpecOptions> & { indent?: string; quotes?: string }) => {
	if (opts) {
		opts = { ...defaultFormat, ...defaultOpts, ...opts };
	} else {
		opts = { ...defaultFormat, ...defaultOpts };
	}
	const indent = createIndent(opts.indent);
	const quote = createQuote(opts.quotes);
	const tag = opts.selector;
	const tagHtml = quote(`<${tag}></${tag}>`);

	return `import { newSpecPage } from ${quote('@stencil/core/testing')};
import { ${opts.className} } from ${quote(`./${opts.tag}`)};

describe(${quote(opts.className)}, () => {
${indent(1)}it(${quote('builds')}, () => {
${indent(2)}expect(new ${opts.className}()).toBeTruthy();
${indent(1)}});
});

describe(${quote(opts.selector)}, () => {
${indent(1)}it(${quote(`should render ${tag}`)}, () => {
${indent(2)}const page = await newSpecPage({
${indent(3)}components: [${opts.className}],
${indent(3)}html: ${tagHtml}
${indent(2)}});

${indent(2)}expect(page.root).toEqualHtml(${tagHtml});
${indent(1)}});
});
`;
};

export default spec;
