import { FileSystem } from '../fs/interface';
import * as ts from 'typescript';
import * as path from 'path';

export async function loadConfigFile(fs: FileSystem, configPath: string) {
    return await requireConfigFile(fs, configPath);
}

export async function requireConfigFile(fs: FileSystem, configFilePath: string) {
    // load up the source code
    let sourceText = await fs.readFile(configFilePath);

    sourceText = convertSourceConfig(sourceText, configFilePath);

    // ensure we cleared out node's internal require() cache for this file
    delete require.cache[path.resolve(configFilePath)];

    // let's override node's require for a second
    // don't worry, we'll revert this when we're done
    const defaultLoader = require.extensions['.js'];
    require.extensions['.js'] = (module: any, filename: string) => {
        if (filename === configFilePath) {
            module._compile(sourceText, filename);
        } else {
            defaultLoader(module, filename);
        }
    };

    // let's do this!
    const config = require(configFilePath);

    // all set, let's go ahead and reset the require back to the default
    require.extensions['.js'] = defaultLoader;

    // good work team
    return config;
}

export function convertSourceConfig(sourceText: string, configFilePath: string) {
    if (configFilePath.endsWith('.ts')) {
        // looks like we've got a typed config file
        // let's transpile it to .js quick
        sourceText = transpileTypedConfig(sourceText, configFilePath);

    } else {
        // quick hack to turn a modern es module
        // into and old school commonjs module
        sourceText = sourceText.replace(/export\s+\w+\s+(\w+)/gm, 'exports.$1');
    }

    return sourceText;
}


function transpileTypedConfig(sourceText: string, filePath: string) {
    // let's transpile an awesome stencil.config.ts file into
    // a boring stencil.config.js file

    const opts: ts.TranspileOptions = {
        fileName: filePath,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            esModuleInterop: true,
            target: ts.ScriptTarget.ES5
        },
        reportDiagnostics: false
    };

    const output = ts.transpileModule(sourceText, opts);

    return output.outputText;
}
