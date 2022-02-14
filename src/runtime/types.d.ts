export interface ParsedContentMeta {
  /**
   * Content id
   */
  id: string
  /**
   * Content slug
   */
  slug?: string
  /**
   * Content title
   */
  title?: string
  /**
   * Content position generated from file path
   */
  position?: string
  /**
   * Content draft status
   */
  draft?: boolean
  /**
   * Content partial status
   */
  partial?: boolean

  [key: string]: any
}

export interface ParsedContent {
  meta: ParsedContentMeta
  body: any
}

//
export interface MarkdownNode {
  type: string
  tag?: string
  value?: string
  props?: Record<string, any>
  content?: any
  children?: MarkdownNode[]

  attributes?: Record<string, any>
  fmAttributes?: Record<string, any>
}

export interface MarkdownHtmlNode extends MarkdownNode {
  type: 'html'
  value: string
}

export interface MarkdownRoot {
  type: 'root'
  children: MarkdownNode[]
  props?: Record<string, any>
}

export interface MarkdownOptions {
  mdc: boolean
  toc: {
    depth: number
    searchDepth: number
  }
  tagMap: Record<string, string>
  highlighter?: any
  components: Array<any | Array<any>>
  remarkPlugins: Array<any | Array<any>>
  rehypePlugins: Array<any | Array<any>>
}

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export interface Toc {
  title: string
  depth: number
  searchDepth: number
  links: TocLink[]
}

///

export interface ContentPlugin {
  name: string
  extentions: string[]
  parse?(id: string, content: string): Promise<ParsedContent> | ParsedContent
  transform?: ((content: ParsedContent) => Promise<ParsedContent>) | ((content: ParsedContent) => ParsedContent)
}

/**
 * Query
 */

export interface QueryBuilderParams {
  slug: string
  deep: boolean
  skip: number
  limit: number
  only: string[]
  without: string[]
  sortBy: Array<string[]>
  where: object
  surround: {
    query: string | object
    before: number
    after: number
  }

  [key: string]: any
}

export interface QueryBuilder<T = ParsedContent> {
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
  surround(slugOrPath: string | object, count?: Partial<{ before: number; after: number }>): QueryBuilder<T>

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

export type QueryPipe<T = any> = (data: Array<T>, param: QueryBuilderParams) => Array<T> | void

export type DatabaseFetcher<T> = (params: QueryBuilderParams) => Promise<Array<T> | T>

export type QueryMatchOperator = (item: any, condition: any) => boolean

export type QueryChainAction<T = ParsedContent> = (
  param: QueryBuilderParams,
  query: QueryBuilder<T>
) => (...args: any[]) => QueryBuilder<T> | void

export interface QueryPlugin {
  name: string
  operators?: Record<string, QueryMatchOperator>
  queries?: Record<string, QueryChainAction>
  execute?: QueryPipe
}

// Navigation
export interface NavItem {
  title: string
  position: string
  slug: string
  id?: string
  draft?: boolean
  partial?: boolean
  children?: NavItem[]
}
