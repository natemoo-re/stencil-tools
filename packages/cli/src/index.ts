#!/usr/bin/env node

import * as color from 'colorette';
import * as path from 'path';
import * as prompt from 'prompts';

import { cwd } from 'process';
import { StencilGenerator } from '@stencil-tools/generator';
import { fs } from './sys';
import { getProjectRoot, isStencilProject } from './utils/project';

import { GenerateComponent, GenerateTest, RenameComponent } from './commands';
export let Generator: StencilGenerator;

const USAGE_DOCS = `Usage:
st generate [component-name]
`;

const run = async () => {
    Generator = new StencilGenerator({ fs }, await getProjectRoot() as string);
    
    let args: string[];
    try {
        if (!(await isStencilProject())) throw new Error(`${color.cyan(path.basename(cwd()))} does not appear to be a Stencil project`);

        args = process.argv.slice(2);

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
                    case 'components':
                        const components = args.slice(2);
                        for (let component of components) {
                            await GenerateComponent(component)
                        }
                        break;
                    case 'test':
                    case 'tests':
                        try {
                            await GenerateTest(args[2]);
                        } catch (e) {
                            if (e.code === 'ENOENT') {
                                throw new Error(`Could not find a component for ${color.cyan(args[2])}`)
                            }
                        }
                        break;
                    default:
                        throw new Error('generate requires a [schematic]');
                }
                break;
            case 'rename':
                await RenameComponent(args[1], args[2]);
                break;
            default: 
                throw new Error(USAGE_DOCS);       
        }
    } catch (e) {
        let msg = (typeof e === 'string') ? e : (e.message) ? e.message : 'An unexpected error occured';
        if (msg.endsWith('already exist') && msg.split(',').length === 4) {
            msg = 'That component already exists!';
        }
        console.error(`\n${color.red('✖')} ${msg}\n`);

        if (msg.endsWith('already exist') || msg.endsWith('already exists!')) {
            const { overwrite } = await prompt({
                type: 'confirm',
                name: 'overwrite',
                message: `Overwrite the existing ${args[1].replace(/s$/, '')}s?`,
                initial: false
            } as any)

            if (overwrite) await Generator.force();
        }
    }
}

run();
