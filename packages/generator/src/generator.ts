import * as path from 'path';
import { ContentGenerator } from './content-generator';
import { FileSystem } from './fs/interface';
import { mkdirp } from './fs/utils';
import { createSelector, dashToPascal, loadConfigFile, guessPrefix, deriveStyleExt, deriveIndent, getReferencedStyles, getComponentClassName } from './utils/index';
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
        
        const indent = await deriveIndent(this.sys.fs, this.rootDir);
        if (indent) { this.set('indent' as any, indent as any ) }
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

    async rename(from: string, to: string, opts?: { baseDir?: string, componentClassName?: string }) {
        const defaultOpts = {
            baseDir: '',
            componentClassName: ''
        };
        opts = { ...defaultOpts, ...opts };

        const className = opts.componentClassName ? opts.componentClassName : dashToPascal(to);
        let fromDir = opts.baseDir.endsWith(from) ? opts.baseDir : path.join(opts.baseDir, from);
        let toDir = opts.baseDir.endsWith(to) ? opts.baseDir : path.join(opts.baseDir, to);
        
        let files: Map<string, string> = new Map();
        let newFiles: Map<string, string> = new Map();
        let styles: string[];
        let fromClassName: string;
        let baseFiles = ['tsx', 'e2e.ts', 'spec.ts']
            .map(ext => `${from}.${ext}`)
            .map(fileName => path.join(fromDir, fileName));
        
        const [component, ...tests] = await Promise.all(baseFiles.map(file => this.sys.fs.readFile(file)));
        files.set(baseFiles[0], component);
        files.set(baseFiles[1], tests[0]);
        files.set(baseFiles[2], tests[1]);
        if (component) {
            styles = getReferencedStyles(component);
            fromClassName = getComponentClassName(component);
        }
        
        let baseStyles = styles
            .map(fileName => path.isAbsolute(fileName) ? fileName : path.join(fromDir, fileName));
        const styleFiles = await Promise.all(baseStyles.map(file => this.sys.fs.readFile(file)));
        for (let i = 0; i < styles.length; i++) {
            const fileName = baseStyles[i];
            const fileContent = styleFiles[i];
            files.set(fileName, fileContent);
        }

        const escape = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tagPattern = new RegExp(`\\b${escape(from)}\\b`, 'g');
        const classNamePattern = new RegExp(`\\b${escape(fromClassName)}\\b`, 'g');

        for (let [fileName, fileContent] of files.entries()) {
            newFiles.set(fileName.replace(tagPattern, to), fileContent.replace(tagPattern, to).replace(classNamePattern, className));
        }

        await mkdirp(this.sys.fs, path.dirname(path.join(toDir, to)));
        await Promise.all([[...files.keys()].map(filePath => this.sys.fs.unlink(filePath))])
        await this.sys.fs.rmdir(fromDir)
        
        let tasks: any = [];
        for (let [filePath, fileContent] of newFiles.entries()) {
            tasks.push(this.sys.fs.writeFile(filePath, fileContent));
        }
        await Promise.all(tasks);
    }


    async create(name: string, opts: GeneratorOptions) {
        await this.initialize();
        if (!this.inStencilProject) throw new Error('Stencil Generator does not appear to be running inside of a Stencil project. Is @stencil/core installed?');
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
            return Promise.reject(`${deferred.map(x => path.basename(x.filePath)).join(', ')} already exist`);
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

    set(config: 'indent', value: { style: 'space', size: number }): void;
    set(config: 'indent', value: { style: 'tab' }): void;
    set(config: 'quote', value: 'single' | 'double'): void;
    set(config: string, value: any): void {
        ContentGenerator.set(config as any, value as any);
    }
}