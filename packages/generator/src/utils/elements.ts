import * as ts from 'typescript';
import * as path from 'path';
import { FileSystem } from '../fs/interface';

const getElements = async (fs: FileSystem, baseDir: string) => {
    const sourceText = await fs.readFile(path.join(baseDir, 'src', 'components.d.ts'));
    const sourceFile = ts.createSourceFile('components.d.ts', sourceText, ts.ScriptTarget.ESNext);
    
    let elements: string[] = []
    const walk = (node: ts.Node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.getText(sourceFile) === 'StencilIntrinsicElements') {
            node.forEachChild(x => {
                if (ts.isPropertySignature(x)) elements.push(x.name.getText(sourceFile).replace(/['"]/gm, ''));
            })
        }
        node.forEachChild(walk);
    }

    sourceFile.forEachChild(walk);
    
    return elements;
}

export default getElements;