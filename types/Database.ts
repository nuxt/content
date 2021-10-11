export interface QueryBuilder<T> {
  /**
   * Select a subset of fields
   * @param {Array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  only(keys: string | string[]): QueryBuilder<T>

  /**
   * Remove a subset of fields
   * @param {Array} keys - Array of fields to be picked.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  without(keys: string | string[]): QueryBuilder<T>

  /**
   * Sort results
   * @param {string} field - Field key to sort on.
   * @param {string} direction - Direction of sort (asc / desc).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  sortBy(field: string, direction: 'asc' | 'desc'): QueryBuilder<T>

  /**
   * Filter results
   * @param {object} query - Where query.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  where(query: any): QueryBuilder<T>

  /**
   * Surround results
   * @param {string} slugOrPath - Slug or path of the file to surround.
   * @param {Object} options - Options to surround (before / after).
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  surround(slugOrPath: string, count: { before: number; after: number }): QueryBuilder<T>

  /**
   * Limit number of results
   * @param {number} n - Limit number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  limit(count: number): QueryBuilder<T>

  /**
   * Skip number of results
   * @param {number} n - Skip number.
   * @returns {QueryBuilder} Returns current instance to be chained
   */
  skip(count: number): QueryBuilder<T>

  /**
   * Collect data and apply process filters
   * @returns {(Object|Array)} Returns processed data
   */
  fetch(params?: any): Promise<T | T[]>
}

export interface QueryBuilderParams {
  skip: number
  limit: number
  only: string[]
  without: string[]
  sortBy: Array<string[]>
  where: object

  [key: string]: any
}

export interface SearchOptions {
  sortBy: string[]
  skip: number
  limit: number
  only: string[] | string
  without: string[] | string
  where: any
  surround: string[]
  deep: boolean
  text: boolean
}

export interface DatabaseProvider {
  getItem<T>(key: string): T
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
  //
  search<T>(query: string, params: any): Promise<T[]>
  query<T>(query: string, params: any): QueryBuilder<T>
  //
  serialize(): Promise<any>
  load(serialized: any): void | Promise<void>
}

export interface DocusContent<T> {
  search: (to?: string | SearchOptions, options?: SearchOptions) => QueryBuilder<T>
  fetch: <T>(path: string, opts?: any) => Promise<T>
  get: <T>(id: string) => Promise<T>
  preview: (previewKey?: string) => this
}
