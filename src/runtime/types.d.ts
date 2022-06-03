import type { Theme } from 'shiki-es'

export interface ParsedContentMeta {
  /**
   * Content id
   */
  _id: string
  /**
   * Content source
   */
  _source?: string
  /**
   * Content path, this path is source agnostic and it the content my live in any source
   */
  _path?: string
  /**
   * Content title
   */
  title?: string
  /**
   * Content draft status
   */
  _draft?: boolean
  /**
   * Content partial status
   */
  _partial?: boolean
  /**
   * Content locale
   */
  _locale?: boolean
  /**
   * File type of the content, i.e `markdown`
   */
  _type?: string
  /**
   * Path to the file relative to the content directory
   */
  _file?: string
  /**
   * Extension of the file
   */
  _extension?: string

  [key: string]: any
}

export interface ParsedContent extends ParsedContentMeta {
  /**
   * Excerpt
   */
  excerpt?: any
  /**
   * Content body
   */
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

export interface MarkdownParsedContent extends ParsedContent {
  _type: 'markdown',
  /**
   * Content is empty
   */
  _empty: boolean
  /**
   * Content description
   */
  description: string
  /**
   * Content excerpt, generated from content
   */
  excerpt?: MarkdownRoot
  /**
   * Parsed Markdown body with included table of contents.
   */
  body: MarkdownRoot & {
    toc?: Toc
  }
}

export interface ContentTransformer {
  name: string
  extensions: string[]
  parse?(id: string, content: string): Promise<ParsedContent> | ParsedContent
  transform?: ((content: ParsedContent) => Promise<ParsedContent>) | ((content: ParsedContent) => ParsedContent)
}

/**
 * Query
 */
export interface SortParams {
  /**
   * Locale specifier for sorting
   * A string with a BCP 47 language tag
   *
   * @default undefined
   */
  $locale?: string
  /**
   * Whether numeric collation should be used, such that "1" < "2" < "10".
   * Possible values are `true` and `false`;
   *
   * @default false
   */
  $numeric?: boolean
  /**
   * Whether upper case or lower case should sort first.
   * Possible values are `"upper"`, `"lower"`, or `"false"`
   *
   * @default "depends on locale"
   */
  $caseFirst?: 'upper' | 'lower' | 'false'
  /**
   * Which differences in the strings should lead to non-zero result values. Possible values are:
   *  - "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A.
   *  - "accent": Only strings that differ in base letters or accents and other diacritic marks compare as unequal. Examples: a ≠ b, a ≠ á, a = A.
   *  - "case": Only strings that differ in base letters or case compare as unequal. Examples: a ≠ b, a = á, a ≠ A.
   *  - "variant": Strings that differ in base letters, accents and other diacritic marks, or case compare as unequal. Other differences may also be taken into consideration. Examples: a ≠ b, a ≠ á, a ≠ A.
   *
   * @default "variant"
   */
  $sensitivity?: 'base' | 'accent' | 'case' | 'variant'
}

export interface SortFields {
  [field: string]: -1 | 1
}

export type SortOptions = SortParams | SortFields

export interface QueryBuilderParams {
  first?: boolean
  skip?: number
  limit?: number
  only?: string[]
  without?: string[]
  sort?: SortOptions[]
  where?: object[]
  surround?: {
    query: string | object
    before?: number
    after?: number
  }

  [key: string]: any
}

export interface QueryBuilder<T = ParsedContentMeta> {
  /**
   * Select a subset of fields
   */
  only<K extends keyof T | string>(keys: K): QueryBuilder<Pick<T, K>>
  only<K extends (keyof T | string)[]>(keys: K): QueryBuilder<Pick<T, K[number]>>

  /**
   * Remove a subset of fields
   */
  without<K extends keyof T | string>(keys: K): QueryBuilder<Omit<T, K>>
  without<K extends (keyof T | string)[]>(keys: K): QueryBuilder<Omit<T, K[number]>>

  /**
   * Sort results
   */
  sort(options: SortOptions): QueryBuilder<T>

  /**
   * Filter results
   */
  where(query: any): QueryBuilder<T>

  /**
   * Limit number of results
   */
  limit(count: number): QueryBuilder<T>

  /**
   * Skip number of results
   */
  skip(count: number): QueryBuilder<T>

  /**
   * Fetch list of contents
   */
  find(): Promise<Array<T>>

  /**
   * Fetch first matched content
   */
  findOne(): Promise<T>

  /**
   * Fetch sorround contents
   */
  findSurround(query: string | object, options?: Partial<{ before: number; after: number }>): Promise<Array<T>>

  /**
   * Filter contents based on locale
   */
  locale(locale: string): QueryBuilder<T>

  /**
   * Retrieve query builder params
   * @internal
   */
  params: () => readonly QueryBuilderParams
}

export type QueryPipe<T = any> = (data: Array<T>, param: QueryBuilderParams) => Array<T> | void

export type DatabaseFetcher<T> = (params: QueryBuilderParams) => Promise<Array<T> | T>

export type QueryMatchOperator = (item: any, condition: any) => boolean

// Navigation
export interface NavItem {
  title: string
  _path: string
  _id?: string
  _draft?: boolean
  children?: NavItem[]

  [key: string]: any
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
