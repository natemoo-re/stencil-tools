// import * as vscode from 'vscode';
// import { Observable } from 'rxjs';
// import { GetConfig } from '../config/get';

// interface Plugin {
//     name: string,
//     import: string
// }
// export const PLUGINS: { [key: string]: Plugin } = {
//     Less: { name: '@stencil/less', import: 'less' },
//     PostCSS: { name: '@stencil/postcss', import: 'postcss' },
//     Sass: { name: '@stencil/sass', import: 'sass' },
//     Stylus: { name: '@stencil/stylus', import: 'stylus' },
// }

// export function InstallPlugin() {
//     const config = GetConfig();
//     let selectPluginNameDialog$ = Observable.from(
//         vscode.window.showQuickPick(Object.keys(PLUGINS), { placeHolder: 'Please select a Stencil Plugin to install', canPickMany: false})
//     )

//     selectPluginNameDialog$
//         .map((key: string) => {
//             const plugin = PLUGINS[key];
//             console.log(plugin.name);
            
//             return plugin;
//         })
//         .map(plugin => {
//             const importStatement = `import { ${plugin.import} } from ${config.quotes}${plugin.name}${config.quotes};`
//             const pluginStatement = `${plugin.import}()`
//         })
//         .subscribe(
//             () => vscode.window.setStatusBarMessage('Plugin Successfuly installed!', 5000),
//             err => vscode.window.showErrorMessage(err.message)
//         );
// }