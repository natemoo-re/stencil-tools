import { Node } from 'typescript';
import { getStencilImport, ImportLine } from '../completions/auto-import';
import { TextDocumentIdentifier, Range } from 'vscode-languageserver';
import { ProjectManager } from '../../../project-manager';

import { getDecoratedMembers, getComponentOptions, getReferencedLinks } from './util';

export interface DocumentMetadata {
	stencilImport: ImportLine;
	componentOptions: { value: { [key: string]: any }, range: Range, text: string };
	componentMembers: string[];
	methods: string[];
	props: string[];
	states: string[];
	watched: string[];
	links: Node[];
}

export class MetadataService {

	constructor(private projectManager: ProjectManager) { }
	
	private _versions = new Map<string, number>();
	private _cache = new Map<string, DocumentMetadata>();

	private collectMetadata({ uri }: TextDocumentIdentifier): DocumentMetadata {
		const sourceFile = this.projectManager.getSourceFile({ uri });
		const stencilImport = getStencilImport(sourceFile);
		const componentOptions = getComponentOptions(sourceFile);
		const links = getReferencedLinks(sourceFile);
		const { methods, members, props, states, watched } = getDecoratedMembers(sourceFile);

		return {
			componentMembers: members,
			stencilImport,
			componentOptions,
			links,
			methods, props, states, watched
		};
	}

	get({ uri }: TextDocumentIdentifier): DocumentMetadata {
		let document = this.projectManager.getDocument({ uri });
		
		if (this._cache.has(uri) && this._versions.get(uri) === document.version) {
			return this._cache.get(uri);
		} else {
			const metadata = this.collectMetadata({ uri });
			this._versions.set(uri, document.version);
			this._cache.set(uri, metadata);
		
			return metadata;
		}
	}
}