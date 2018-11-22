#!/usr/bin/env node

import { StencilLanguageServer } from './language-server';
import { createConnection, IConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-languageserver';

const connection: IConnection = createConnection(new StreamMessageReader(process.stdin), new StreamMessageWriter(process.stdout));
new StencilLanguageServer(connection);