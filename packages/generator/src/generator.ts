import * as path from 'path';
import { ContentGenerator } from './content-generator';
import { FileSystem } from './fs/interface';
import { createSelector, dashToPascal, loadConfigFile } from './utils/index';

interface GeneratorOptions {
    baseDir: string;
    generateComponent?: boolean;
    componentPrefix?: string;
    componentImports?: string[];
    componentShadow?: boolean;
    generateStyle?: boolean;
    styleExt?: string;
    generateE2E?: boolean;
    generateSpec?: boolean;
}

export class StencilGenerator {

    async mkdirp(dir: string): Promise<void> {
        try {
            await this.sys.fs.mkdir(dir);
        } catch (e) {
            switch (e.code) {
                case 'ENOENT': return this.mkdirp(path.dirname(dir)).then(() => this.mkdirp(dir))
            }
        }
    }

    constructor(private sys: { fs: FileSystem }) { }

    async onStencilConfigChange(configPath: string) {
        if (!path.isAbsolute(configPath)) {
            throw new Error(`Stencil configuration file "${configPath}" must be an absolute path.`);
        }

        const config = loadConfigFile(this.sys.fs, configPath);
        console.log(config);
    }

    async create(name: string, opts: GeneratorOptions) {
        const defaultOpts: GeneratorOptions = {
            baseDir: '',
            generateComponent: true,
            componentPrefix: '',
            componentImports: [],
            componentShadow: true,
            generateStyle: true,
            styleExt: 'css',
            generateE2E: true,
            generateSpec: true
        }
        const className = dashToPascal(name);
        const selector = createSelector(name, opts.componentPrefix);
        let dirname: string;
        
        opts = { ...defaultOpts, ...opts };
        const tasks: { filePath: string, content: string }[] = [];

        if (opts.generateComponent || opts.generateE2E || opts.generateSpec || opts.generateStyle) {
            dirname = opts.baseDir.endsWith(name) ? opts.baseDir : path.join(opts.baseDir, name);
            await this.mkdirp(dirname);
        }

        if (opts.generateComponent) {
            const filePath = path.join(dirname, `${name}.tsx`);
            const content = ContentGenerator.component({
                selector,
                className,
                tag: name,
                prefix: opts.componentPrefix,
                shadow: opts.componentShadow,
                imports: opts.componentImports,
                styleExt: opts.styleExt
            })
            tasks.push({ filePath, content });
        }
        if (opts.generateStyle) {
            const filePath = path.join(dirname, `${name}.${opts.styleExt}`);
            const content = ContentGenerator.style({
                selector,
                tag: name,
                shadow: opts.componentShadow
            })
            tasks.push({ filePath, content });
        }
        if (opts.generateE2E) {
            const filePath = path.join(dirname, `${name}.e2e.ts`);
            const content = ContentGenerator.e2e({
                selector,
                className
            })
            tasks.push({ filePath, content });
        }
        if (opts.generateSpec) {
            const filePath = path.join(dirname, `${name}.spec.ts`);
            const content = ContentGenerator.spec({
                selector,
                className
            })
            tasks.push({ filePath, content });
        }

        await Promise.all(tasks.map(({ filePath, content }) => this.sys.fs.writeFile(filePath, content)));
        return Promise.resolve();
    }
}