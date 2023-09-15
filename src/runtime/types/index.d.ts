import type { Theme } from 'shiki-es'
import type { StorageValue } from 'unstorage'

export interface ParsedContentInternalMeta {
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
  _locale?: string
  /**
   * File type of the content, i.e `markdown`
   */
  _type?: 'markdown' | 'yaml' | 'json' | 'csv'
  /**
   * Path to the file relative to the content directory
   */
  _file?: string
  /**
   * Extension of the file
   */
  _extension?: 'md' | 'yaml' | 'yml' | 'json' | 'json5' | 'csv'
}

export interface ParsedContentMeta extends ParsedContentInternalMeta {
  /**
   * Layout
   */
  layout?: string

  [key: string]: any
}

export interface ParsedContent extends ParsedContentMeta {
  /**
   * Excerpt
   */
  excerpt?: MarkdownRoot
  /**
   * Content body
   */
  body: MarkdownRoot
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
  toc?: Toc
}

export interface MarkdownPlugin extends Record<string, any> {}

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
  remarkPlugins: Record<string, false | (MarkdownPlugin & { instance: any })>
  rehypePlugins: Record<string, false | (MarkdownPlugin & { instance: any })>
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
  parse?(id: string, content: StorageValue, options: any): Promise<ParsedContent> | ParsedContent
  transform?(content: ParsedContent, options: any): Promise<ParsedContent> | ParsedContent
}

export interface TransformContentOptions {
  transformers?: ContentTransformer[]

  [key: string]: any
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

export interface QueryBuilderWhere extends Partial<Record<keyof ParsedContentInternalMeta, string | number | boolean | RegExp | QueryBuilderWhere>> {
  /**
   * Match only if all of nested conditions are true
   *
   * @example
    ```ts
    queryContent().where({
      $and: [
        { score: { $gte: 5 } },
        { score: { $lte: 10 } }
      ]
    })
    ```
   **/
  $and?: QueryBuilderWhere[]
  /**
   * Match if any of nested conditions is true
   *
   * @example
    ```ts
    queryContent().where({
      $or: [
        { score: { $gt: 5 } },
        { score: { $lt: 3 } }
      ]
    })
    ```
   **/
  $or?: QueryBuilderWhere[]
  /**
   * Match is condition is false
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $not: 'Hello World'
      }
    })
    ```
   **/
  $not?: string | number | boolean | RegExp | QueryBuilderWhere
  /**
   * Match if item equals condition
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $eq: 'Hello World'
      }
    })
    ```
   **/
  $eq?: string | number | boolean | RegExp
  /**
   * Match if item not equals condition
   *
   * @example
    ```ts
    queryContent().where({
      score: {
        $ne: 100
      }
    })
    ```
   **/
  $ne?: string | number | boolean | RegExp
  /**
   * Check if item is greater than condition
   *
   * @example
    ```ts
    queryContent().where({
      score: {
        $gt: 99.5
      }
    })
    ```
   */
  $gt?: number
  /**
   * Check if item is greater than or equal to condition
   *
   * @example
    ```ts
    queryContent().where({
      score: {
        $gte: 99.5
      }
    })
    ```
   */
  $gte?: number
  /**
   * Check if item is less than condition
   *
   * @example
    ```ts
    queryContent().where({
      score: {
        $lt: 99.5
      }
    })
    ```
   */
  $lt?: number
  /**
   * Check if item is less than or equal to condition
   *
   * @example
    ```ts
    queryContent().where({
      score: {
        $lte: 99.5
      }
    })
    ```
   */
  $lte?: number
  /**
   * Provides regular expression capabilities for pattern matching strings.
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $regex: /^foo/
      }
    })
    ```
   */
  $regex?: RegExp | string
  /**
   * Match if type of item equals condition
   *
   * @example
    ```ts
    queryContent().where({
      field: {
        $type: 'boolean'
      }
    })
    ```
   */
  $type?: string
  /**
   * Check key existence
   *
   * @example
    ```ts
    queryContent().where({
      tag: {
        $exists: false
      }
    })
    ```
   */
  $exists?: boolean
  /**
   * Match if item contains every condition or math every rule in condition array
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $contains: ['Hello', 'World']
      }
    })
    ```
   **/
  $contains?: Array<string | number | boolean> | string | number | boolean
  /**
   * Match if item contains at least one rule from condition array
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $containsAny: ['Hello', 'World']
      }
    })
    ```
   */
  $containsAny?: Array<string | number | boolean>
  /**
   * Ignore case contains
   *
   * @example
    ```ts
    queryContent().where({
      title: {
        $icontains: 'hello world'
      }
    })
    ```
   **/
  $icontains?: string
  /**
   * Match if item is in condition array
   *
   * @example
    ```ts
    queryContent().where({
      category: {
        $in: ['sport', 'nature', 'travel']
      }
    })
    ```
   **/
  $in?: string | Array<string | number | boolean>

  [key: string]: string | number | boolean | RegExp | QueryBuilderWhere | Array<string | number | boolean | QueryBuilderWhere>
}

export interface QueryBuilderParams {
  first?: boolean
  skip?: number
  limit?: number
  only?: string[]
  without?: string[]
  sort?: SortOptions[]
  where?: QueryBuilderWhere[]
  surround?: {
    query: string | QueryBuilderWhere
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
  where(query: QueryBuilderWhere): QueryBuilder<T>

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
  findSurround(query: string | QueryBuilderWhere, options?: Partial<{ before: number; after: number }>): Promise<Array<T>>

  /**
   * Count matched contents
   */
  count(): Promise<number>

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

export type DatabaseFetcher<T> = (query: QueryBuilder<T>) => Promise<Array<T> | T>

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
