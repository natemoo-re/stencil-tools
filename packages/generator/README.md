[Stencil Tools](https://github.com/natemoo-re/stencil-tools/) / 
# Generator

Generator is an Stencil Tools package used internally to share common logic between delpoyment targets. 
As the name suggests, it is primarily concerned with generating component files and tests, but there are a few other common utilities included as well.

#### Using the Generator
```bash
npm i @stencil-tools/generator
```

```ts
import { StencilGenerator } from '@stencil-tools/generator';

const Generator = new StencilGenerator({ fs }, pathToProjectRoot);
```

Note that since Generator is filesystem agnostic, so an `fs` implementation needs to be passed to the StencilGenerator constructor. The constructor also requires the absolute path to the project's root, which enables the generators to be config-aware (automatically resolving the extension of style files, indentation, quote marks, etc)

