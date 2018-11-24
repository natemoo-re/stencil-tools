import { Generator } from '../index';
import * as path from 'path';
import { getProjectRoot } from '../utils/project';

export default async (from: string, to: string) => {
    if (!from || !to) throw new Error('rename [from-tag] [to-tag]');
    const root = await getProjectRoot();

    await Generator.rename(from, to, {
        baseDir: path.join(root as string, 'src', 'components')
    });
}
