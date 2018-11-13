import { StencilLanguageServer } from './language-server';
import { createConnection, ProposedFeatures } from 'vscode-languageserver';

const connection = createConnection(ProposedFeatures.all);
new StencilLanguageServer(connection);