import { DidChangeWatchedFilesParams, FileChangeType } from 'vscode-languageserver';
import { ProjectManager } from '../../project-manager';
import { logger } from '../../language-server';

export class WatchService {
    constructor(private projectManager: ProjectManager) { }

    reset(files: string[]) {
        this.projectManager.setFiles(files);

        logger.info(this.projectManager.getFiles());
    }
    
    update({ changes }: DidChangeWatchedFilesParams) {
        for (let { type, uri } of changes) {
            switch (type) {
                case FileChangeType.Created:
                    this.projectManager.addFile(uri);
                    break;
                case FileChangeType.Deleted:
                    logger.info('DELETE', uri);
                    this.projectManager.removeFile(uri);
                    break;
                case FileChangeType.Changed:
                    this.projectManager.addFile(uri);
                    break;
                default: break;
            }
        }

        logger.info(this.projectManager.getFiles());
    }
    
}