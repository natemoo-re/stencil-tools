import { Generator } from '../../index';
import * as path from 'path';
import { getProjectRoot } from '../../utils/project';

export default async (tag: string) => {
    if (!tag) throw new Error('generate component requires a [component-tag]');
    const root = await getProjectRoot();
    
    await Generator.create(tag, {
        baseDir: path.join(root as string, 'src', 'components')
    });
}
