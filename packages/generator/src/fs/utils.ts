import { dirname } from 'path';
import { FileSystem } from './interface';

export const mkdirp = async (fs: FileSystem, dir: string): Promise<void> => {
    try {
        await fs.mkdir(dir);
    } catch (e) {
        switch (e.code) {
            case 'ENOENT': return mkdirp(fs, dirname(dir)).then(() => mkdirp(fs, dir))
        }
    }
}