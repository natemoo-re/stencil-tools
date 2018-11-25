/// @ts-check
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const data = {
    repo: 'natemoo-re/stencil-tools',
    title: 'Stencil Tools',
    description: 'Stencil Tools is a suite of editor enhancements and utilities for <a href="https://stenciljs.com">Stencil</a> projects.',
    packages: [
        {
            id: 'cli',
            title: 'CLI',
            url: 'https://npmjs.com/@stencil-tools/cli',
            gitUrl: './packages/cli'
        },
        {
            id: 'vscode',
            title: 'Visual Studio Code',
            url: '',
            gitUrl: './extensions/vscode'
        },
        {
            id: 'atom',
            title: 'Atom',
            url: '',
            gitUrl: './extensions/atom'
        }
    ]
}

const raw = (asset) => `https://raw.githubusercontent.com/${data.repo}/master/${asset.replace(/^\//, '').replace(/\.svg$/, '.svg?sanitize=true')}`;
const packageInfo = (pkg) => `[<img src="${raw(`.github/assets/targets/${pkg.id}.svg`)}" width="14" height="14"> **${pkg.title}**](${pkg.gitUrl})`;

const h1 = (title) => `<h1 align="center">${title}</h1>`;
const p = (content) => `<p align="center">${content}</p>`;

const generate = async () => {
    let readme = `<div align="center">
	<a href="https://npmjs.org/package/@stencil-tools/cli">
    <img src="https://img.shields.io/npm/v/@stencil-tools/cli.svg?style=flat-square" alt="NPM version" />
  </a>
	<a href="https://npmjs.org/package/@stencil-tools/cli">
    <img src="https://img.shields.io/npm/dt/@stencil-tools/cli.svg?style=flat-square" alt="Download" />
  </a>
</div>

<br>
<br>
<br>
<br>
<br>

<p align="center">
	<img src="${raw('.github/assets/logo.svg')}" width="128" height="128">
</p>
${h1(data.title)}
${p(data.description)}

## Packages

${data.packages.map((pkg) => packageInfo(pkg)).join('\n\n')}

## Changelog
Most recent changes go here...

[View More](./CHANGELOG.md)
`;
    
    await writeFile(path.resolve(__dirname, path.join('..', 'README.md')), readme);
}

generate()