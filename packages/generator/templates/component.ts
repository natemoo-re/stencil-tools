import { ComponentOptions } from './options';

const defaultOpts: ComponentOptions = {
    quotes: `'`,
    indent: '  ',
    imports: [],
    prefix: '',
    tag: 'my-component',
    styleExt: 'css',
    className: 'MyComponent',
    shadow: true
}

const component = (opts: Partial<ComponentOptions>) => {
    opts = { ...defaultOpts, ...opts };
    const indent = (n: number = 1) => opts.indent.repeat(n);
    const quote = (text: string) => `${opts.quotes}${text}${opts.quotes}`;
    
    const imports = `{ ${['Component', ...opts.imports].join(', ')} }`;
    const tag = `${opts.prefix}-${opts.tag}`;
    const styleUrl = `${opts.tag}${opts.styleExt}`;
    const shadow = opts.shadow ? `,\n${indent(1)}shadow: true` : '';

    return `import ${imports} from ${quote('@stencil/core')};

@Component({
${indent(1)}tag: ${quote(tag)},
${indent(1)}styleUrl: ${quote(styleUrl)}${shadow}
})
export class ${opts.className} {

${indent(1)}render() {
${indent(2)}return (
${indent(3)}<div>
${indent(4)}<p>Hello <code>${tag}</code></p>
${indent(3)}</div>
${indent(2)});
${indent(1)}}
}
`;
}

export default component;
