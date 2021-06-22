import type { Database } from './database';
import type { QueryBuilder } from './query-builder'

export type contentFunc = (...args: Array<string | Object>) => QueryBuilder;

export interface IContentDocumentBase extends Record<string, any> {
  dir: string;
  path: string;
  extension: '.md' | '.json' | '.yaml' | '.xml' | '.csv' | string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  body?: object;
  toc?: {
    id: string;
    depth: number;
    text: string;
  }[];
}

export interface IContentDocument extends IContentDocumentBase {
  createdAt: Date;
  updatedAt: Date;
}

export type File = {
  path: string;
  extension: string;
  data: any;
}

export type contentFileBeforeInstert = (document: IContentDocument, database: Database) => void;

export type extendOrOverwrite<T> = ((old: T) => T) | T;

export type contentFileBeforeParse = (file: File) => void;

