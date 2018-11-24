function evalText(text: string) {
    const fnStr = `return ${text};`;
    return new Function(fnStr)();
}

export const createSelector = (tag: string, prefix?: string) => prefix && !tag.startsWith(prefix) ? `${prefix.replace(/-$/g, '')}-${tag}` : tag;

/**
 * Given a list of StencilIntrinsicElements, guesses a global prefix
 * If all the elements share a prefix, it will return that
 */
export const guessPrefix = (intrinsicElements: string[]): string|null => {
    const prefixes = intrinsicElements.map(tag => tag.split('-')[0]);
    const prefix = prefixes[0];
    
    return prefixes.every(p => p === prefix) ? prefix : null;
}

export const getComponentOptions = (sourceText: string): any => {
    const pattern = /\@Component\(([\s\S]+?)\)/g;
    const match = pattern.exec(sourceText);
    if (match && match[1]) return evalText(match[1]);
    return null;
}

export const getComponentClassName = (sourceText: string): string => {
    const pattern = /\@Component[\s\S]+?export\s*(?:default|)\s*class([\s\S]*?)\{/g;
    const match = pattern.exec(sourceText);
    if (match && match[1]) return match[1].trim();
    return null;
}

export const getReferencedStyles = (sourceText: string): string[] => {
    const componentOpts = getComponentOptions(sourceText);
    let styles: string[] = [];

    if (componentOpts) {
        if (componentOpts.styleUrl) {
            const { styleUrl } = componentOpts;
            if (typeof styleUrl === 'string') { styles = [...styles, styleUrl]; }
        }
        if (componentOpts.styleUrls) {
            const { styleUrls } = componentOpts;
            if (Array.isArray(styleUrls)) styles = [...styles, ...styleUrls];
            if (typeof styleUrls === 'object') styles = [...styles, ...Object.values(styleUrls) as string[]];
        }
    }

    return styles;
}