import { SpecOptions } from './options';

const defaultOpts: SpecOptions = {
    quotes: `'`,
    indent: '  ',
    selector: 'my-component',
    className: 'MyComponent'
}

const spec = (opts: Partial<SpecOptions>) => {
    opts = { ...defaultOpts, ...opts };
    // const indent = (n: number = 1) => opts.indent.repeat(n);

    return ``;
}

export default spec;