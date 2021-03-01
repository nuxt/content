import type { IContentDocument } from './content';
interface QueryBuilderOptions {
  query: any;
  path: string;
  init: any;
  text: any;
  postprocess?: any[];
}

export class QueryBuilder {
  constructor(
    { query, path, init, text, postprocess }: QueryBuilderOptions,
    options: any
  );
  query: any;
  path: string;
  init: any;
  postprocess: any[];
  options: any;
  onlyKeys: any[];
  withoutKeys: any;
  sortKeys: any[];
  limitN: number;
  skipN: number;
  /**
   * Select a subset of fields
   * @param keys - fields to be picked.
   * @returns current instance to be chained
   */
  only(keys: string[] | string): QueryBuilder;
  /**
   * Remove a subset of fields
   * @param keys - fields to be picked.
   * @returns current instance to be chained
   */
  without(keys: string[] | string): QueryBuilder;
  /**
   * Sort results
   * @param field - Field key to sort on.
   * @param direction - Direction of sort (asc / desc).
   * @returns current instance to be chained
   */
  sortBy(field: string, direction?: 'asc' | 'desc'): QueryBuilder;
  /**
   * Filter results
   * @param query - Where query.
   * @returns current instance to be chained
   */
  where(query: object): QueryBuilder;
  /**
   * Search results
   * @param query - Search query object or field or search value.
   * @param value - Value of search (means query equals to field).
   * @returns current instance to be chained
   */
  search(query: any | string, value?: string): QueryBuilder;
  /**
   * Surround results
   * @param slugOrPath - Slug or path of the file to surround.
   * @param options - Options to surround (before / after).
   * @returns current instance to be chained
   */
  surround(slugOrPath: string, { before, after }?: any): QueryBuilder;
  /**
   * Limit number of results
   * @param n - Limit number.
   * @returns current instance to be chained
   */
  limit(n: number | string): QueryBuilder;
  /**
   * Skip number of results
   * @param n - Skip number.
   * @returns current instance to be chained
   */
  skip(n: number | string): QueryBuilder;
  /**
   * Collect data and apply process filters
   * @returns processed data
   */
  fetch(): Promise<IContentDocument | IContentDocument[]>;
  fetch<T>(): Promise<(T & IContentDocument) | (T & IContentDocument)[]>;
}
