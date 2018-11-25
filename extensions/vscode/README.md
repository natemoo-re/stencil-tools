[![Version](https://vsmarketplacebadge.apphb.com/version/natemoo-re.vscode-stencil-tools.svg)](https://marketplace.visualstudio.com/items?itemName=natemoo-re.vscode-stencil-tools) 
[![Installs](https://vsmarketplacebadge.apphb.com/installs/natemoo-re.vscode-stencil-tools.svg)](https://marketplace.visualstudio.com/items?itemName=natemoo-re.vscode-stencil-tools)

[Stencil Tools](https://github.com/natemoo-re/stencil-tools/) / 
# VS Code Extension

VS Code extension that makes working with [Stencil](https://stenciljs.com/) projects a breeze.

### Features
- Automatically creates Stencil components (`component.tsx`, `component.spec.tsx`, `component.css`)
- Snippets with Automatic Import support for Stencil Decorators, Lifecycle Events, and Tests
- Easily start any new Stencil project from the Command Palette
- Quickly open the Stencil Docs in your browser
- Configurable component templates
    - Add a custom prefix to generated component tags
    - Easily toggle on/off @Component({ shadow: true })
    - Change the extension of any generated file
        - `css` => `scss` or `sass`
        - `spec.ts` => `test.ts`

## Usage
### Generate a Component
![New Component](./assets/tutorial/new-component.gif)
- From the File Explorer
    - Right click on a folder
    - Select "Generate Stencil Component"
    - Enter your component name in the prompt
- From the Command Palette
    - Select "> Stencil: New Component"
    - Enter your component name in the prompt

### Generate a Test from a Component
- From the File Explorer
    - Right click on a component file
    - Select "Generate Test for Stencil Component"
- From the Command Palette, when a Component is open
    - Select "> Stencil: New Test for Component"

### Start a Stencil Project
![Start a Project](./assets/tutorial/new-project.gif)
- From the Command Palette
    - Select "> Stencil: Start New Project"
    - Select a Starter (components, app, pwa)
    - Choose an empty directory and click "Start Project"
    - When you open the new project, Stencil Tools will automatically prepare the project and install any dependencies

### Use Stencil Snippets
![Use Snippets](./assets/tutorial/use-snippets.gif)
- From a Component File
    - type `s-` and select your snippet

### Open the Stencil Docs
![Open Docs](./assets/tutorial/open-docs.gif)
- From the Command Palette
    - Select "> Stencil: Open Docs"

## Changelog
### 2.0.0 (2018-06-11)
- Breaking Change: command names are now properly namespaced
- Overhaul of the `Start Project` feature
- Brand new snippets with AutoImport
- Small optimizations to the Component and Test Generators
- [Read More](./CHANGELOG.md#2.0.0)

#### 1.0.0 (2018-06-06)
- Published the extension to VS Code Marketplace

## Bugs
Please report [here](https://github.com/natemoo-re/vscode-stencil-tools/issues)

## Credits
- [vscode-angular2-component-generator](https://github.com/dbaikov/vscode-angular2-component-generator) for the original fork
- [create-stencil](https://github.com/ionic-team/create-stencil) for much of the `Start Project` logic