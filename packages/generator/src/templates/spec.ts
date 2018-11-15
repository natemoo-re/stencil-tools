import { SpecOptions } from './declarations';
import { defaultFormat } from './shared';

const defaultOpts: SpecOptions = {
    selector: 'my-component',
    className: 'MyComponent'
}

const spec = (opts: Partial<SpecOptions> & { indent: string, quotes: string }) => {
    if (opts) {
        opts = { ...defaultFormat, ...defaultOpts, ...opts }
    } else {
        opts = { ...defaultFormat, ...defaultOpts }
    }
    // const indent = (n: number = 1) => opts.indent.repeat(n);

    return ``;
}

export default spec;