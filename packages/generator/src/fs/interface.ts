export interface FileSystem {
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string, opts?: FsWriteOptions): Promise<void>;
    mkdir(dirPath: string): Promise<void>;
    stat(path: string): Promise<FsStats>;
    rmdir(dirPath: string): Promise<void>;
    unlink(filePath: string): Promise<void>;
    // copyFile(src: string, dest: string): Promise<void>;
    // createReadStream(filePath: string): any;
    // exists(filePath: string): Promise<boolean>;
    // existsSync(filePath: string): boolean;
    // mkdirSync(dirPath: string): void;
    // readdir(dirPath: string): Promise<string[]>;
    // readdirSync(dirPath: string): string[];
    // readFileSync(filePath: string): string;
    // statSync(path: string): FsStats;
    // writeFile(filePath: string, content: string, opts?: FsWriteOptions): Promise<void>;
    // writeFileSync(filePath: string, content: string, opts?: FsWriteOptions): void;
}


export interface FsStats {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
}


export interface FsReadOptions {
    useCache?: boolean;
    setHash?: boolean;
}


export interface FsReaddirOptions {
    inMemoryOnly?: boolean;
    recursive?: boolean;
}


export interface FsReaddirItem {
    absPath: string;
    relPath: string;
    isDirectory: boolean;
    isFile: boolean;
}


export interface FsWriteOptions {
    inMemoryOnly?: boolean;
    clearFileCache?: boolean;
    immediateWrite?: boolean;
    useCache?: boolean;
}


export interface FsWriteResults {
    changedContent?: boolean;
    queuedWrite?: boolean;
    ignored?: boolean;
}


export interface FsItems {
    [filePath: string]: FsItem;
}


export interface FsItem {
    fileText?: string;
    isFile?: boolean;
    isDirectory?: boolean;
    size?: number;
    mtimeMs?: number;
    exists?: boolean;
    queueWriteToDisk?: boolean;
    queueDeleteFromDisk?: boolean;
    useCache?: boolean;
}