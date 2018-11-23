import * as path from 'path';
import { ContentGenerator } from './content-generator';
import { FileSystem } from './fs/interface';
import { mkdirp } from './fs/utils';
import { createSelector, dashToPascal, loadConfigFile, guessPrefix, deriveStyleExt } from './utils/index';
import getStencilIntrinsicElements from './utils/elements';

interface Options {
    baseDir: string;
    force?: boolean;
    mkdir?: boolean;
}
interface ComponentOptions {
    generateComponent?: boolean;
    componentPrefix?: string;
    componentImports?: string[];
    componentShadow?: boolean;
    componentClassName?: string;
}

interface StyleOptions {
    generateStyle?: boolean;
    styleExt?: string;
}

interface TestOptions {
    generateE2E?: boolean;
    generateSpec?: boolean;
    componentPrefix?: string;
    componentClassName?: string;
}

type GeneratorOptions = Options & ComponentOptions & StyleOptions & TestOptions;

export class StencilGenerator {

    private inStencilProject: boolean = false;
    private componentPrefix: string = '';

    private config: any;
    constructor(private sys: { fs: FileSystem }, private rootDir: string) {
        if (!path.isAbsolute(rootDir)) throw new Error('StencilGenerator requires a `rootDir`, an absolute path to the project\'s root directory');
    }

    private async initialize() {
        await this.setConfig();
        this.inStencilProject = await this.isStencilProject();
        await this.updateComponents();
    }

    private async isStencilProject(): Promise<boolean> {
        if (this.config) return true;
        
        const { fs } = this.sys;

        try {
            const pkg = await fs.readFile(path.join(this.rootDir, 'package.json')).then(pkg => JSON.parse(pkg));
            const deps = [...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies];
            
            return Object.keys(deps).some(x => x.startsWith('@stencil'))
        } catch (e) {
            return false;
        }
    }

    private async setConfig() {
        const { fs } = this.sys;
        const tsPath = path.join(this.rootDir, 'stencil.config.ts');
        const jsPath = path.join(this.rootDir, 'stencil.config.js');
        
        try {
            if (await fs.stat(tsPath).then(x => x.isFile())) {
                this.config = await loadConfigFile(fs, tsPath);
            } else if (await fs.stat(jsPath).then(x => x.isFile())) {
                this.config = await loadConfigFile(fs, jsPath);
            } else {
                this.config = null;
            }
        } catch (e) {
            this.config = null;
        }
    }

    public async updateComponents() {
        const intrinsicElements = await getStencilIntrinsicElements(this.sys.fs, this.rootDir);
        this.componentPrefix = guessPrefix(intrinsicElements);
    }

    public async exists(path: string) {
        try {
            const stat = await this.sys.fs.stat(path);
            return stat.isFile() || stat.isDirectory() || stat.isSymbolicLink();
        } catch (e) {
            return false;
        }
    }

    private cache: Map<'create' | 'deferred', any> = new Map();


    async create(name: string, opts: GeneratorOptions) {
        await this.initialize();
        if (!this.inStencilProject) throw new Error('Stencil Generator does not appear to be running inside of a Stencil project. Is @stencil/core installed?');
        console.log(this.config);
        const styleExt = await deriveStyleExt(this.config);

        this.cache = new Map();
        const defaultOpts: GeneratorOptions = {
            baseDir: '',
            mkdir: true,
            force: false,
            generateComponent: true,
            componentPrefix: this.componentPrefix,
            componentImports: [],
            componentShadow: true,
            generateStyle: true,
            styleExt,
            generateE2E: true,
            generateSpec: true
        }
        opts = { ...defaultOpts, ...opts };
        const className = opts.componentClassName ? opts.componentClassName : dashToPascal(name);
        const selector = createSelector(name, opts.componentPrefix);
        let dirname: string = opts.baseDir;
        
        const tasks: { filePath: string, content: string }[] = [];
        const deferred: { filePath: string, content: string }[] = [];

        if (opts.generateComponent || opts.generateE2E || opts.generateSpec || opts.generateStyle) {
            if (opts.mkdir) {
                dirname = opts.baseDir.endsWith(name) ? opts.baseDir : path.join(opts.baseDir, name);
                await mkdirp(this.sys.fs, dirname);
            }
        }

        if (opts.generateComponent) {
            const fileName = `${name}.tsx`
            const filePath = path.join(dirname, fileName);
            const exists = await this.exists(filePath);
            const content = ContentGenerator.component({
                selector,
                className,
                tag: name,
                prefix: opts.componentPrefix,
                shadow: opts.componentShadow,
                imports: opts.componentImports,
                styleExt: opts.styleExt
            })

            if (!exists || opts.force) {
                tasks.push({ filePath, content });
            } else {
                deferred.push({ filePath, content });
            }
        }
        if (opts.generateStyle) {
            const fileName = `${name}.${opts.styleExt}`;
            const filePath = path.join(dirname, fileName);
            const exists = await this.exists(filePath);
            const content = ContentGenerator.style({
                selector,
                shadow: opts.componentShadow
            })
            if (!exists || opts.force) {
                tasks.push({ filePath, content });
            } else {
                deferred.push({ filePath, content });
            }
        }
        if (opts.generateE2E) {
            const fileName = `${name}.e2e.ts`;
            const filePath = path.join(dirname, fileName);
            const exists = await this.exists(filePath);
            const content = ContentGenerator.e2e({
                selector,
                className
            })
            if (!exists || opts.force) {
                tasks.push({ filePath, content });
            } else {
                deferred.push({ filePath, content });
            }
        }
        if (opts.generateSpec) {
            const fileName = `${name}.spec.ts`;
            const filePath = path.join(dirname, fileName);
            const exists = await this.exists(filePath);
            const content = ContentGenerator.spec({
                tag: name,
                selector,
                className
            })

            if (!exists || opts.force) {
                tasks.push({ filePath, content });
            } else {
                deferred.push({ filePath, content });
            }
        }

        if (deferred.length) {
            this.cache.set('deferred', deferred);
            await Promise.all(tasks.map(({ filePath, content }) => this.sys.fs.writeFile(filePath, content)));
            return Promise.reject(`${deferred.map(x => path.basename(x.filePath)).join(', ')}`);
        } else {
            await Promise.all(tasks.map(({ filePath, content }) => this.sys.fs.writeFile(filePath, content)));
            return Promise.resolve();
        }
    }

    async createTests(name: string, opts: Options & TestOptions) {
        const defaultOpts: GeneratorOptions = {
            baseDir: '',
            generateE2E: true,
            generateSpec: true
        }
        const overrideOpts: Partial<GeneratorOptions> = {
            mkdir: false,
            generateComponent: false,
            generateStyle: false,
        }
        const generatorOpts: GeneratorOptions = { ...defaultOpts, ...opts, ...overrideOpts }
        return this.create(name, generatorOpts)
    }

    async force() {
        if (!this.cache.size) return Promise.resolve();

        const tasks = [...this.cache.get('deferred')]
        await Promise.all(tasks.map(({ filePath, content }) => this.sys.fs.writeFile(filePath, content)));
        return Promise.resolve();
    }
}