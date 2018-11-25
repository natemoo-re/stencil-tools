[Stencil Tools](https://github.com/natemoo-re/stencil-tools/) / 
# CLI


The Stencil Tools CLI is a command-line interface which allows you to generate Stencil component files and tests, as well as perform other common workflows such as renaming components across your project.

#### Installation
```bash
npm i -g @stencil-tools/cli
```

Woohoo! You're ready to use the CLI (exposed as `st`).

You can double check that your installation was successful by running
```bash
st -v
```

#### Commands

**`generate`** (`g`, `new`, `n`)

```bash
st generate [component|tests] [tag]
```


**`rename`**

```bash
st rename [from-tag] [to-tag]
```
