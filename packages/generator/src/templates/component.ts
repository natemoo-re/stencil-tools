import { ComponentOptions } from './declarations';
import { defaultFormat, createIndent, createQuote } from './shared';

const defaultImports: string[] = ['Component', 'h'];
const defaultOpts: ComponentOptions = {
	imports: ['Host'],
	prefix: '',
	selector: 'my-component',
	tag: 'my-component',
	styleExt: 'css',
	className: 'MyComponent',
	shadow: true
};

const component = (opts?: Partial<ComponentOptions> & { indent?: string; quotes?: string }) => {
	if (opts) {
		opts = { ...defaultFormat, ...defaultOpts, ...opts };
	} else {
		opts = { ...defaultFormat, ...defaultOpts };
	}
	const indent = createIndent(opts.indent);
	const quote = createQuote(opts.quotes);

	const imports = `{ ${[...defaultImports, ...opts.imports]
		.filter((imp, index, coll) => index === coll.indexOf(imp))
		.sort()
		.join(', ')} }`;
	const tag = opts.selector;
	const styleUrl = `${opts.tag}.${opts.styleExt}`;
	const shadow = opts.shadow ? `,\n${indent(1)}shadow: true` : '';

	return `import ${imports} from ${quote('@stencil/core')};

@Component({
${indent(1)}tag: ${quote(tag)},
${indent(1)}styleUrl: ${quote(styleUrl)}${shadow}
})
export class ${opts.className} {

${indent(1)}render() {
${indent(2)}return (
${indent(3)}<Host>
${indent(4)}<p>Hello <code>${tag}</code></p>
${indent(3)}</Host>
${indent(2)});
${indent(1)}}
}
`;
};

export default component;
