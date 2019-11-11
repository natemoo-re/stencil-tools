import { E2EOptions } from './declarations';
import { defaultFormat, createIndent, createQuote } from './shared';

const defaultOpts: E2EOptions = {
	selector: 'my-component',
	className: 'MyComponent',
	url: '/'
};

const e2e = (opts?: Partial<E2EOptions> & { indent?: string; quotes?: string }) => {
	if (opts) {
		opts = { ...defaultFormat, ...defaultOpts, ...opts };
	} else {
		opts = { ...defaultFormat, ...defaultOpts };
	}
	const indent = createIndent(opts.indent);
	const quote = createQuote(opts.quotes);
	const tag = opts.selector;

	return `import { newE2EPage } from ${quote('@stencil/core/testing')};

describe(${quote(opts.selector)}, () => {
${indent(1)}it(${quote('renders')}, async () => {
${indent(2)}const page = await newE2EPage();
${indent(2)}await page.setContent(${quote(`<${tag}></${tag}>`)});

${indent(2)}const element = await page.find(${quote(tag)});
${indent(2)}expect(element).not.toBeNull();
${indent(1)}});
});
`;
};

export default e2e;
