export interface ComponentOptions {
    tag: string;
    prefix: string;
    selector: string;
    className: string;
    imports: string[];
    styleExt: string;
    shadow: boolean;
}

export interface StyleOptions {
    selector: string;
    shadow: boolean;
    styleExt: string;
}

export interface E2EOptions {
    selector: string;
    className: string;
}

export interface SpecOptions {
    selector: string;
    className: string;
}
