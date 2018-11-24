import { Generator } from '../../index';
import * as path from 'path';
import { getProjectRoot } from '../../utils/project';
import { fs } from '../../sys';

export default async (tag: string) => {
    if (!tag) throw new Error('generate test requires a [component-tag]');
    const root = await getProjectRoot();

    let componentClassName: string = null;
    try {
        const sourceText = await fs.readFile(path.join(root as string, 'src', 'components', tag, `${tag}.tsx`));
        const className = /\@Component(?:[\s\S])+export class\s?(\w+)/g.exec(sourceText)[1];
        componentClassName = className ? className.trim() : null;
    } catch (e) { }

    await Generator.createTests(tag, {
        baseDir: path.join(root as string, 'src', 'components', tag),
        componentClassName
    });
}