export const uppercase = (str: string) => str.toUpperCase();
export const lowercase = (str: string) => str.toLowerCase();

export const lowercaseFirst = (str: string) => `${lowercase(str.charAt(0))}${str.substr(1)}`;
export const uppercaseFirst = (str: string) => `${uppercase(str.charAt(0))}${str.substr(1)}`;

export const dashToCamel = (str: string) => str.replace(/-([a-z])/g, (m) => uppercase(m[1]));
export const dashToPascal = (str: string) => uppercaseFirst(dashToCamel(str));