import { StyleOptions } from './declarations';
import { defaultFormat, createIndent } from './shared';

const defaultOpts: StyleOptions = {
    selector: 'my-component',
    styleExt: 'css',
    shadow: true
}

const style = (opts?: Partial<StyleOptions> & { indent?: string }) => {
    if (opts) {
        opts = { ...defaultFormat, ...defaultOpts, ...opts }
    } else {
        opts = { ...defaultFormat, ...defaultOpts }
    }

    const indentedSyntax = opts.styleExt === 'sass';
    const indent = createIndent(opts.indent);
    const selector = opts.shadow ? ':host' : opts.selector;

    if (indentedSyntax) {
        return `${selector}
${indent(1)}/* display: block; */
`;
    } else {
        return `${selector} {
${indent(1)}/* display: block; */
}
`;
    }
}

export default style;