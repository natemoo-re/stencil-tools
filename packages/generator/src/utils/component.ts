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