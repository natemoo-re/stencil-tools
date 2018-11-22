const path = require('path');
const { AutoLanguageClient } = require('atom-languageclient');

const sourceScopes = ['source.js', 'source.js.jsx', 'javascript', 'source.ts', 'source.tsx', 'typescript'];
const scopes = [...sourceScopes];
const sourceExts = ['.js', '.jsx', '.ts', '.tsx'];
const styleExts = ['.css', '.scss', '.sass', '.less', '.pcss', '.postcss', '.styl'];
const extensions = [...sourceExts, ...styleExts];

class StencilLanguageClient extends AutoLanguageClient {

    getGrammarScopes() { return scopes; }
    getLanguageName() { return 'TypeScript' }
    getServerName() { return 'StencilLanguageServer' }

    startServerProcess() {
        const args = [require.resolve('\@stencil-tools/languageserver/dist/stdio')]
        return super.spawnChildNode(args);

        // return super.spawnChildNode(args, { cwd: path.join(__dirname, '..') })
    }

    preInitialization(connection) {
        connection.onCustom('$/partialResult', () => { }); // Suppress partialResult until the language server honours 'streaming' detection
    }

    filterChangeWatchedFiles(filePath) {
        return extensions.indexOf(path.extname(filePath).toLowerCase()) > -1;
    }
}

module.exports = new StencilLanguageClient();