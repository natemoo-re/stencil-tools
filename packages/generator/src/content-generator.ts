import component from './templates/component';
import style from './templates/style';
import e2e from './templates/e2e';
import spec from './templates/spec';
import { ComponentOptions, StyleOptions, E2EOptions, SpecOptions } from './templates/declarations';

class Generator {
    private indent: string = '  ';
    private quotes: string = "'";

    set(config: 'indent', value: { style: 'space', size: number }): void;
    set(config: 'indent', value: { style: 'tab' }): void;
    set(config: 'quote', value: 'single' | 'double'): void;
    set(config: string, value: any): void {
        switch (config) {
            case 'quote':
                this.quotes = (value === 'single') ? `'` : `"`;
                break;
            case 'indent':
                this.indent = (value.style === 'space') ? ' '.repeat(value.size) : '\t';
                break;
        }
    }

    component(opts: Partial<ComponentOptions>) {
        const { indent, quotes } = this;
        return component({ ...opts, indent, quotes });
    };
    
    style(opts: Partial<StyleOptions>) {
        const { indent } = this;
        return style({ ...opts, indent });
    };
    
    e2e(opts: Partial<E2EOptions>) {
        const { indent, quotes } = this;
        return e2e({ ...opts, indent, quotes });
    };
    
    spec(opts: Partial<SpecOptions>) {
        const { indent, quotes } = this;
        return spec({ ...opts, indent, quotes });
    }
}

export const ContentGenerator = new Generator();
