#!/usr/bin/env node

import * as color from 'colorette';
import * as path from 'path';

import { cwd } from 'process';
import { StencilGenerator } from '@stencil-tools/generator';
import { fs } from './sys';
import { getProjectRoot, isStencilProject } from './utils/project';

import { GenerateComponent } from './commands';
export let Generator: StencilGenerator;

const USAGE_DOCS = `Usage:
st generate [component-name]
`;

const run = async () => {
    Generator = new StencilGenerator({ fs }, await getProjectRoot() as string);
    
    try {
        if (!(await isStencilProject())) throw new Error(`${color.cyan(path.basename(cwd()))} does not appear to be a Stencil project`);

        let args = process.argv.slice(2);

        const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0;
        const info = args.indexOf('--info') >= 0;

        args = args.filter(a => a[0] !== '-');
    
        switch (args[0]) {
            case 'g':
            case 'generate':
            case 'new':
            case 'n':
                switch (args[1]) {
                    case 'component':
                        await GenerateComponent(args[2]);
                        // console.log()
                        break;
                    default:
                        throw new Error('generate requires a [schematic]');
                }
                break;
            default: 
                throw new Error(USAGE_DOCS);       
        }
    } catch (e) {
        console.error(`\n${color.red('✖')} ${e.message}\n`);
    }
}

run();
