import * as path from 'path';
import { cwd } from 'process';
import { StencilGenerator } from '@stencil-tools/generator';
import { fs } from './sys';

const run = async () => {
    const generator = new StencilGenerator({ fs }, cwd())
    
    await generator.create('my-component', {
        baseDir: path.join(cwd(), 'demo', 'components'),
        styleExt: 'scss'
    })
}

run();
