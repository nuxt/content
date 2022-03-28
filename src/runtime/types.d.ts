import type { Theme } from 'shiki-es'

export interface ParsedContentMeta {
  /**
   * Content id
   */
  id: string
  /**
   * Content source
   */
  source?: string
  /**
   * Content path, this path is source agnostic and it the content my live in any source
   */
  path?: string
  /**
   * Content slug
   */
  slug?: string
  /**
   * Content title
   */
  title?: string
  /**
   * Content draft status
   */
  draft?: boolean
  /**
   * Content partial status
   */
  partial?: boolean
  /**
   * Content locale
   */
  locale?: boolean

  [key: string]: any
}

export interface ParsedContent extends ParsedContentMeta{
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
  /**
   * Enable/Disable MDC components.
   */
  mdc: boolean
  toc: {
    /**
     * Maximum heading depth to include in the table of contents.
     */
    depth: number
    searchDepth: number
  }
  tags: Record<string, string>
  remarkPlugins: Array<any | [any, any]>
  rehypePlugins: Array<any | [any, any]>
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
  first: boolean
  skip: number
  limit: number
  only: string[]
  without: string[]
  sortBy: Array<string[]>
  where: object[]
  surround: {
    query: string | object
    before?: number
    after?: number
  }

  [key: string]: any
}

export interface QueryBuilder {
  /**
   * Select a subset of fields
   */
  only(keys: string | string[]): QueryBuilder

  /**
   * Remove a subset of fields
   */
  without(keys: string | string[]): QueryBuilder

  /**
   * Sort results
   */
  sortBy(field: string, direction: 'asc' | 'desc'): QueryBuilder

  /**
   * Filter results
   */
  where(query: any): QueryBuilder

  /**
   * Limit number of results
   */
  limit(count: number): QueryBuilder

  /**
   * Skip number of results
   */
  skip(count: number): QueryBuilder

  /**
   * Fetch list of contents
   */
  find(): Promise<Array<ParsedContentMeta>>

  /**
   * Fetch first matched content
   */
  findOne(): Promise<ParsedContentMeta>

  /**
   * Fetch sorround contents
   */
  findSurround(query: string | object, options?: Partial<{ before: number; after: number }>): Promise<Array<ParsedContentMeta>>
}

export type QueryPipe<T = any> = (data: Array<T>, param: QueryBuilderParams) => Array<T> | void

export type DatabaseFetcher<T> = (params: QueryBuilderParams) => Promise<Array<T> | T>

export type QueryMatchOperator = (item: any, condition: any) => boolean

export interface QueryPlugin {
  name: string
  operators?: Record<string, QueryMatchOperator>
  queries?: (param: QueryBuilderParams, query: QueryBuilder) => Record<string, (...args: any[]) => any> | void
  execute?: QueryPipe
}

// Navigation
export interface NavItem {
  title: string
  slug: string
  id?: string
  draft?: boolean
  partial?: boolean
  children?: NavItem[]
}

// Highlight
export interface HighlightParams {
  code: string
  lang: string
  theme: Theme
}

export interface HighlightThemedToken {
  content: string
  color?: string
}
