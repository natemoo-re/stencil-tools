import { cwd } from 'process';
import * as path from 'path';
import { fs } from '../sys';

export const getProjectRoot = async (max: number = 8) => {
    let iterations = 0;
    
    const search = async (root: string): Promise<string|boolean> => {
        iterations++;
        if (iterations >= max) return false;
        const pkg = await fs.exists(path.join(root, 'package.json'));
        return (pkg) ? root : search(path.dirname(root));
    }
    
    return search(cwd());
}

export const isStencilProject = async () => {
    const root = await getProjectRoot();

    if (!root) return false;

    if (typeof root === 'string') {
        // Does stencil.config.ts exist?
        const configTs = await fs.exists(path.join(root, 'stencil.config.ts'));
        if (configTs) return true;

        // Does stencil.config.js exist?
        const configJs = await fs.exists(path.join(root, 'stencil.config.js'));
        if (configJs) return true;
        
        // If not, that's fine! Those are optional
        // Let's check if @stencil/core is installed
        try {
            const pkg = await fs.readFile(path.join(root, 'package.json'));
            const { dependencies, devDependencies } = JSON.parse(pkg);
            return [...Object.keys(dependencies), ...Object.keys(devDependencies)].includes('@stencil/core');
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}