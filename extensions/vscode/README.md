[![Version](https://vsmarketplacebadge.apphb.com/version/natemoo-re.vscode-stencil-tools.svg)](https://marketplace.visualstudio.com/items?itemName=natemoo-re.vscode-stencil-tools) 
[![Installs](https://vsmarketplacebadge.apphb.com/installs/natemoo-re.vscode-stencil-tools.svg)](https://marketplace.visualstudio.com/items?itemName=natemoo-re.vscode-stencil-tools)

[Stencil Tools](https://github.com/natemoo-re/stencil-tools/) / 
# VS Code Extension

This extension adds rich language features for [Stencil](https://stenciljs.com/) projects to Visual Studio Code.

![Demo](./assets/demo.gif)

## Features

### IntelliSense

- Auto Completion of built-in component methods (`hostData`, `render`) and lifecycle methods (`componentWillLoad`, `componentDidLoad`, etc)
- Intelligent suggestions for `Watch` and `Listen` statements
- Path Completion for `Component` styles and assets
- Quick Info for symbols on hover (class member is a `State`, `Prop`, `Method`, etc)

### Code Editing

- Generate Components from Explorer or Command Palette
- Code Snippets for common Stencil features
- Auto Imports for Stencil decorators
- Improved Symbol Rename for `Prop` decorated class members

### Diagnostics

- Inline Stencil diagnostics as you type

### Testing

- Generate unit and e2e tests with new components
- Generate unit and e2e tests for existing components

### Others

- Open Stencil Docs from Command Palette

---

## Internal Packages

Under the hood, `vscode-stencil-tools` relies on 

- [`@stencil-tools/languageserver`]()
- [`@stencil-tools/generator`]()
- [`typescript-plugin-stencil`]()

## Bugs
Please report [here](https://github.com/natemoo-re/stencil-tools/issues)

## Credits
- [create-stencil](https://github.com/ionic-team/create-stencil) for much of the `Start Project` logic