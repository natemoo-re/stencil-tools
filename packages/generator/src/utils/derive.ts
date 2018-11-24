import { FileSystem } from '../fs/interface';
import * as editorconfig from 'editorconfig';
import * as path from 'path';

const STYLE_PLUGINS = ['sass', 'postcss', 'stylus', 'less'];
const STYLE_EXT = ['css', 'scss', 'sass', 'pcss', 'styl', 'stylus', 'less'];

export async function deriveStyleExt(config?: any): Promise<string> {
    let plugins: string[] = []
    if (config && config.plugins) plugins = config.plugins.map((p: any) => p.name);

    try {
        if (plugins.length) {
            let plugin = plugins.find(name => STYLE_PLUGINS.includes(name));
            if (!plugin) throw new Error();

            // TODO Search components to find out what extension is actually being used?
            // sass supports .scss or .sass
            // postcss supports .css or .pcss
            // stylus supports .styl or .stylus
            switch (plugin) {
                case 'sass': return 'scss'
                case 'postcss': return 'css';
                case 'stylus': return 'styl';
                case 'less': return 'less';
            }
        }
        return 'css';
    } catch (e) {
        return 'css';
    }
}

interface Indent {
    style: 'tab' | 'space';
    size?: number;
}
export async function deriveIndent(fs: FileSystem, rootDir: string): Promise<Indent> {
    const econfig = await getEditorConfig(fs, rootDir);
    if (econfig && econfig.indent_style) {
        switch (econfig.indent_style) {
            case 'space': return { style: 'space', size: econfig.indent_size || 2 };
            case 'tab': return { style: 'tab' };
        }
    }

    return null;
}

interface EditorConfig {
    indent_style?: 'tab' | 'space';
    indent_size?: number;
    tab_width?: 2;
}

async function getEditorConfig(fs: FileSystem, rootDir: string): Promise<EditorConfig> {
    try {
        const name = '.editorconfig';
        const contents = await fs.readFile(path.join(rootDir, name));
        const config = await editorconfig.parseString(contents);
        
        if (config) {
            return config as EditorConfig;
        } else {
            throw new Error();
        }
        
    } catch (e) {
        return null;
    }

}