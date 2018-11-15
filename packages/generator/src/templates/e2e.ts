import { E2EOptions } from './declarations';
import { defaultFormat } from './shared';

const defaultOpts: E2EOptions = {
    selector: 'my-component',
    className: 'MyComponent'
}

const e2e = (opts: Partial<E2EOptions> & { indent: string, quotes: string }) => {
    if (opts) {
        opts = { ...defaultFormat, ...defaultOpts, ...opts }
    } else {
        opts = { ...defaultFormat, ...defaultOpts }
    }
    // const indent = (n: number = 1) => opts.indent.repeat(n);

    return ``;
}

export default e2e;