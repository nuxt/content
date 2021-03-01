import type { Loki, Collection } from '@lokidb/loki';
import type { Queue, DefaultAddOptions } from 'p-queue';
import type { FSWatcher } from 'chokidar'
import type PriorityQueue from 'p-queue/dist/priority-queue';
import type { State as YamlOptions } from 'js-yaml';
import type { Options as XMLOptions } from 'xml2js';
import type { CSVParseParam as CSVOptions } from 'csvtojson/v2/Parameters';

import type { IMarkdown } from './parsers/markdown';
import type { IYAML } from './parsers/yaml';
import type { ICSV } from './parsers/csv';
import type { IXML } from './parsers/xml';
import type { MarkdownOptions } from './parsers/markdown';
import type { QueryBuilder } from './query-builder'
import type { IContentDocument } from './content';

type Parser = (file: string) => any;

interface DatabaseOptions {
  dir: string;
  cwd: string;
  markdown: MarkdownOptions;
  yaml: YamlOptions;
  xml: XMLOptions;
  csv: CSVOptions;
  nestedProperties: string[];
  fullTextSearchFields: string[];
  liveEdit: boolean;
  watch: boolean;
  editor: string;
}

interface QueryBuilderOptions {
  deep?: boolean;
  text?: boolean;
}

export class Database {
  constructor(options: DatabaseOptions);
  dir: string;
  cwd: string;
  markdown: IMarkdown;
  yaml: IYAML;
  csv: ICSV;
  xml: IXML;
  db: Loki;
  items: Collection<object, object, object>;
  extendParser: Record<string, Parser>;
  extendParserExtensions: string[];
  options: DatabaseOptions;
  /**
   * Query items from collection
   * @param path - Requested path (path / directory).
   * @returns Instance of QueryBuilder to be chained
   */
  query(path: string, { deep, text }?: QueryBuilderOptions): QueryBuilder;
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
  parseFile(path: string): Promise<IContentDocument>;
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
  queue: Queue<DefaultAddOptions, PriorityQueue>;
  watcher: FSWatcher;
  /**
   * Init database and broadcast change through Websockets
   */
  refresh(event: any, path: any): Promise<void>;
  close(): Promise<void>;
}
