import { Connection, RemoteConsole } from "vscode-languageserver";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export class Logger {
    
    public level: LogLevel = 'info';

    constructor(private connection: Connection) {}
    
    public debug(...msg: any[]): void {
        this.print('debug', ...msg);
    };
    public info(...msg: any[]): void {
        this.print('info', ...msg);
    };
    public warn(...msg: any[]): void {
        this.print('warn', ...msg);
    };
    public error(...msg: any[]): void {
        this.print('error', ...msg);
    };

    // public writeLogs(append: boolean): void { };
    
    // private logFilePath: string;

    private print(level: LogLevel, ...msg: any[]): void {
        const remote: keyof RemoteConsole = (level === 'debug') ? 'log' : level;
        if (this.level === level) {
            const message = this.format(...msg);
            this.connection.console[remote](message);
            this.log = [...this.log, `[${level}] ${message}`];
        }
    }

    private format(...msg: any) {
        let formatted = '';
        for (let value of msg) {
            if (typeof value === 'string') formatted += value;
            else if (typeof value === 'boolean') formatted += (value === true) ? 'true' : 'false';
            else if (typeof value === 'object') formatted += JSON.stringify(value, null, 2);
            else formatted += value.toString();
        }
        return formatted;
    }

    private log: string[] = [];
}
