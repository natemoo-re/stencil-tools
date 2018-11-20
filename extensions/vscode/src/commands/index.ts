import { StencilGenerator } from '@stencil-tools/generator';
import { workspace, Uri } from 'vscode';
import * as sys from '../sys';

import { OpenDocs } from './open-docs';
// import { StartProject } from './start-project';
// import { InstallPlugin } from './install-plugin';
import GenerateComponent from './generate/component';
import GenerateTest from './generate/test';

export const generator: StencilGenerator = new StencilGenerator(sys, workspace.workspaceFolders[0].uri.fsPath);

const commands = new Map<string, any>();
commands.set('openDocs', () => OpenDocs());
// commands.set('startProject', () => StartProject());
// commands.set('installPlugin', () => InstallPlugin());
commands.set('generateComponent', () => GenerateComponent(null))
commands.set('generateComponentFromExplorer', (uri: Uri) => GenerateComponent(uri))
commands.set('generateTest', () => GenerateTest(null))
commands.set('generateTestFromExplorer', (uri: Uri) => GenerateTest(uri))

export default commands;