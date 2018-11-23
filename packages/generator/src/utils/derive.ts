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