export function normalizePath(str: string) {
	// Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
	// https://github.com/sindresorhus/slash MIT
	// By Sindre Sorhus
	if (typeof str !== 'string') {
		throw new Error(`invalid path to normalize`);
	}
	str = str.trim();

	if (EXTENDED_PATH_REGEX.test(str) || NON_ASCII_REGEX.test(str)) {
		return str;
	}

	str = str.replace(SLASH_REGEX, '/');

	// always remove the trailing /
	// this makes our file cache look ups consistent
	if (str.charAt(str.length - 1) === '/') {
		const colonIndex = str.indexOf(':');
		if (colonIndex > -1) {
			if (colonIndex < str.length - 2) {
				str = str.substring(0, str.length - 1);
			}

		} else if (str.length > 1) {
			str = str.substring(0, str.length - 1);
		}
	}

	return str;
}

const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
const SLASH_REGEX = /\\/g;

// https://github.com/TooTallNate/file-uri-to-path
import { sep } from "path";
export function uri2path(uri: string) {
	if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
		throw new TypeError("must pass in a file:// URI to convert to a file path");
	}

	var rest = decodeURI(uri.substring(7));
	var firstSlash = rest.indexOf("/");
	var host = rest.substring(0, firstSlash);
	var path = rest.substring(firstSlash + 1);

	// 2.  Scheme Definition
	// As a special case, <host> can be the string "localhost" or the empty
	// string; this is interpreted as "the machine from which the URL is
	// being interpreted".
	if ("localhost" == host) host = "";

	if (host) {
		host = sep + sep + host;
	}

	// 3.2  Drives, drive letters, mount points, file system root
	// Drive letters are mapped into the top of a file URI in various ways,
	// depending on the implementation; some applications substitute
	// vertical bar ("|") for the colon after the drive letter, yielding
	// "file:///c|/tmp/test.txt".  In some cases, the colon is left
	// unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
	// colon is simply omitted, as in "file:///c/tmp/test.txt".
	path = path.replace(/^(.+)\|/, "$1:");

	// for Windows, we need to invert the path separators from what a URI uses
	if (sep == "\\") {
		path = path.replace(/\//g, "\\");
	}

	if (/^.+\:/.test(path)) {
		// has Windows drive at beginning of path
	} else {
		// unix path…
		path = sep + path;
	}

	return host + path;
}

export function URItoName(uri: string) {
	return normalizePath(uri2path(uri));
}