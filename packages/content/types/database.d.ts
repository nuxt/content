import type { IMarkdown } from './parsers/markdown';
import type { IYAML } from './parsers/yaml';
import type { ICSV } from './parsers/csv';
import type { IXML } from './parsers/xml';
import type { Loki, Collection } from '@lokidb/loki';
import type { QueryBuilder } from './query-builder'

export interface Database {
  constructor(options: any);
  dir: any;
  cwd: any;
  markdown: IMarkdown;
  yaml: IYAML;
  csv: ICSV;
  xml: IXML;
  db: Loki;
  items: Collection<object, object, object>;
  extendParser: any;
  extendParserExtensions: string[];
  options: any;
  /**
   * Query items from collection
   * @param {string} path - Requested path (path / directory).
   * @returns {QueryBuilder} Instance of QueryBuilder to be chained
   */
  query(
    path: string,
    {
      deep,
      text
    }?: {
      deep?: boolean;
      text?: boolean;
    }
  ): QueryBuilder;
  /**
   * Clear items in database and load files into collection
   */
  init(): Promise<void>;
  dirs: string[];
  /**
   * Walk dir tree recursively
   * @param {string} dir - Directory to browse.
   */
  walk(dir: string): Promise<void>;
  /**
   * Insert file in collection
   * @param {string} path - The path of the file.
   */
  insertFile(path: string): Promise<void>;
  /**
   * Update file in collection
   * @param {string} path - The path of the file.
   */
  updateFile(path: string): Promise<void>;
  /**
   * Remove file from collection
   * @param {string} path - The path of the file.
   */
  removeFile(path: string): Promise<void>;
  /**
   * Read a file and transform it to be insert / updated in collection
   * @param {string} path - The path of the file.
   */
  parseFile(
    path: string
  ): Promise<{
    dir: string;
    path: string;
    extension: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  /**
   * Remove base dir and extension from file path
   * @param {string} path - The path of the file.
   * @returns {string} Normalized path
   */
  normalizePath(path: string): string;
  /**
   * Watch base dir for changes
   */
  watch(): void;
  queue: import('p-queue').default<
    import('p-queue/dist/priority-queue').default,
    import('p-queue').DefaultAddOptions
  >;
  watcher: import('chokidar').FSWatcher;
  /**
   * Init database and broadcast change through Websockets
   */
  refresh(event: any, path: any): Promise<void>;
  close(): Promise<void>;
}
