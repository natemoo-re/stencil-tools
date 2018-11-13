import { getStencilImport, StencilImport } from '../completions/auto-import';
import { TextDocumentIdentifier } from 'vscode-languageserver';
import { ProjectManager } from '../../../project-manager';

import { getDecoratedMembers } from './util';

export interface DocumentMetadata {
	stencilImport: StencilImport;
	componentOptions: { [key: string]: any };
	componentMembers: string[];
	methods: string[];
	props: string[];
	states: string[];
	watched: string[];
}

export class MetadataService {

	constructor(private projectManager: ProjectManager) { }
	
	private _versions = new Map<string, number>();
	private _cache = new Map<string, DocumentMetadata>();

	private collectMetadata({ uri }: TextDocumentIdentifier): DocumentMetadata {
		console.log('Collecting Metadata');
		const sourceFile = this.projectManager.getSourceFile({ uri });
		const stencilImport = getStencilImport(sourceFile);
		const { methods, members, props, states, watched } = getDecoratedMembers(sourceFile);

		return {
			stencilImport,
			componentOptions: { },
			componentMembers: members,
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