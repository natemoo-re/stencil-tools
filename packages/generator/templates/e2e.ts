import { E2EOptions } from './options';

const defaultOpts: E2EOptions = {
    quotes: `'`,
    indent: '  ',
    selector: 'my-component',
    className: 'MyComponent'
}

const e2e = (opts: Partial<E2EOptions>) => {
    opts = { ...defaultOpts, ...opts };
    // const indent = (n: number = 1) => opts.indent.repeat(n);

    return ``;
}

export default e2e;