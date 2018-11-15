export const createSelector = (tag: string, prefix?: string) => prefix ? `${prefix.replace(/-$/g, '')}-${tag}` : tag;
