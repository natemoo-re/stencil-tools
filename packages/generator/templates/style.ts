import { StyleOptions } from './options';

const defaultOpts: StyleOptions = {
    indent: '  ',
    tag: 'my-component',
    selector: ':host',
    shadow: true
}

const style = (opts: Partial<StyleOptions>) => {
    opts = { ...defaultOpts, ...opts };
    const indent = (n: number = 1) => opts.indent.repeat(n);
    const selector = opts.shadow ? ':host' : opts.tag;

    return `${selector} {
${indent(1)}/** Styles for ${opts.selector} **/
}
`;
}

export default style;