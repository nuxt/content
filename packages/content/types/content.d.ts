import type { Database } from './database';
import type { QueryBuilder } from './query-builder'

export type contentFunc = (...args: Array<string | Object>) => QueryBuilder;

export interface IContentDocument {
	dir: string;
	path: string;
	extension: '.md' | '.json' | '.yaml' | '.xml' | '.csv';
	slug: string;
	createdAt: Date;
	updatedAt: Date;
	[key: string]: any;
}

export type contentFileBeforeInstert = (document: IContentDocument, database: Database) => void;

export type extendOrOverwrite<T> = ((old: T) => T) | T;