export interface ComponentOptions {
    quotes: string;
    indent: string;
    imports: string[];
    prefix: string;
    tag: string;
    styleExt: string;
    className: string;
    shadow: boolean;
}

export interface StyleOptions {
    indent: string;
    selector: string;
    tag: string;
    shadow: boolean;
}

export interface E2EOptions {
    quotes: string;
    indent: string;
    selector: string;
    className: string;
}

export interface SpecOptions {
    quotes: string;
    indent: string;
    selector: string;
    className: string;
}
