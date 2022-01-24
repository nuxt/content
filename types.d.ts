import './dist/types.d'

interface ParsedContent {
  meta: {
    id: string
    [key: string]: any
  }
  body: any
}

interface ContentPlugin {
  name: string
  extentions: string[]
  parse?(id: string, content: string): Promise<ParsedContent> | ParsedContent
  transform?: ((content: ParsedContent) => Promise<ParsedContent>) | ((content: ParsedContent) => ParsedContent)
}

// Query

interface QueryBuilder<T> {
  /**
   * Set deep to true to fetch all matched documents.
   */
  deep(deep?: boolean): QueryBuilder<T>

  /**
   * Select a subset of fields
   */
  only(keys: string | string[]): QueryBuilder<T>

  /**
   * Remove a subset of fields
   */
  without(keys: string | string[]): QueryBuilder<T>

  /**
   * Sort results
   */
  sortBy(field: string, direction: 'asc' | 'desc'): QueryBuilder<T>

  /**
   * Filter results
   */
  where(query: any): QueryBuilder<T>

  /**
   * Surround results
   */
  surround(slugOrPath: string, count: { before: number; after: number }): QueryBuilder<T>

  /**
   * Limit number of results
   */
  limit(count: number): QueryBuilder<T>

  /**
   * Skip number of results
   */
  skip(count: number): QueryBuilder<T>

  /**
   * Collect data and apply process filters
   */
  fetch(): Promise<T | T[]>
}

interface QueryBuilderParams {
  to: string
  deep: boolean
  skip: number
  limit: number
  only: string[]
  without: string[]
  sortBy: Array<string[]>
  where: object

  [key: string]: any
}

interface DatabaseProvider<T> {
  getItem(key: string): T
  setItem(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
  //
  search(query: string, params: Partial<QueryBuilderParams>): Promise<T[] | T>
  query(query: string, params: Partial<QueryBuilderParams>): QueryBuilder<T>
  //
  serialize(): Promise<any>
  load(serialized: any): void | Promise<void>
}

type QueryPipe<T = any> = (data: Array<T>, param: QueryBuilderParams) => Array<T> | void

type DatabaseFetcher<T> = (params: Partial<QueryBuilderParams>) => Promise<Array<T> | T>

type QueryMatchOperator = (item: any, condition: any) => boolean

type QueryChainAction<T> = (
  param: QueryBuilderParams,
  query: QueryBuilder<T>
) => (...args: any[]) => QueryBuilder<T> | void

interface QueryPlugin {
  name: string
  operators?: Record<string, QueryMatchOperator>
  queries?: Record<string, QueryChainAction>
  execute?: QueryPipe
}
