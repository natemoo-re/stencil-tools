[Stencil Tools](https://github.com/natemoo-re/stencil-tools/) / 
# Language Server

The Stencil Language Server (SLS) is built upon the [Language Server Protocol](https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md). It enables anyone to add support for [Stencil](https://github.com/ionic-team/stencil) projects in their favorite editor.

## Installation
(This won't work yet!)
```bash
npm i stencil-languageserver
```

## Features
- Context-aware completions
	- Decorators (with Automatic Imports)
	- Component Lifecycle Methods
	- Component Methods (`hostData`, `render`)
	- `@Watch(...props)`
	- `@Listen(...events)`
- Document Links
- Diagnostics

To enable these features in your editor, you can install one of the extensions below (or build your own!)

## Editor Plugins
 - **Visual Studio Code**: [Stencil Tools](https://github.com/natemoo-re/vscode-stencil-tools) *(coming soon)*

## Creating an Editor Plugin


## LSP Extensions
This language server implements some LSP extensions, prefixed with an `x`.

- **[Files extension](https://github.com/sourcegraph/language-server-protocol/blob/master/extension-files.md)**
  Allows the server to request file contents without accessing the file system