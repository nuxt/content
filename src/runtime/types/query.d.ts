import { ContentQueryFindResponse, ContentQueryFindOneResponse, ContentQueryCountResponse, ContentQueryWithSurround, ContentQueryWithDirConfig } from './api'
import { ContentQueryCountResponse, ContentQueryResponse, ParsedContentInternalMeta, ParsedContentMeta } from '.'
/**
 * Query
 */

export interface ContentQuerySortParams {
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

export interface ContentQuerySortFields {
  [field: string]: -1 | 1
}

export type ContentQuerySortOptions = ContentQuerySortParams | ContentQuerySortFields

export interface ContentQueryBuilderWhere extends Partial<Record<keyof ParsedContentInternalMeta, string | number | boolean | RegExp | ContentQueryBuilderWhere>> {
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
  $and?: ContentQueryBuilderWhere[]
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
  $or?: ContentQueryBuilderWhere[]
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
  $not?: string | number | boolean | RegExp | ContentQueryBuilderWhere
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
  $in?: Array<string | number | boolean>

  [key: string]: string | number | boolean | RegExp | ContentQueryBuilderWhere | Array<string | number | boolean | ContentQueryBuilderWhere>
}

export interface ContentQueryBuilderParams {
  first?: boolean
  skip?: number
  limit?: number
  only?: string[]
  without?: string[]
  sort?: ContentQuerySortOptions[]
  where?: ContentQueryBuilderWhere[]
  surround?: {
    query: string | ContentQueryBuilderWhere
    before?: number
    after?: number
  }

  [key: string]: any
}

export interface ContentQueryBuilder<T = ParsedContentMeta, Y = {}> {
  /**
   * Select a subset of fields
   */
  only<K extends keyof T | string>(keys: K): ContentQueryBuilder<Pick<T, K>, Y>
  only<K extends (keyof T | string)[]>(keys: K): ContentQueryBuilder<Pick<T, K[number]>, Y>

  /**
   * Remove a subset of fields
   */
  without<K extends keyof T | string>(keys: K): ContentQueryBuilder<Omit<T, K>, Y>
  without<K extends (keyof T | string)[]>(keys: K): ContentQueryBuilder<Omit<T, K[number]>, Y>

  /**
   * Filter results
   */
  where(query: ContentQueryBuilderWhere): ContentQueryBuilder<T, Y>

  /**
   * Sort results
   */
  sort(options: ContentQuerySortOptions): ContentQueryBuilder<T, Y>

  /**
   * Limit number of results
   */
  limit(count: number): ContentQueryBuilder<T, Y>

  /**
   * Skip number of results
   */
  skip(count: number): ContentQueryBuilder<T, Y>

  /**
   * Retrieve query builder params
   * @internal
   */
  params: () => readonly ContentQueryBuilderParams

  /**
   * Filter contents based on locale
   */
  locale(locale: string): ContentQueryBuilder<T, Y>

  /**
   * Fetch list of contents
   */
  find(): Promise<ContentQueryFindResponse<T> & Y>

  /**
   * Fetch first matched content
   */
  findOne(): Promise<ContentQueryFindOneResponse<T> & Y>

  /**
   * Count matched contents
   */
  count(): Promise<ContentQueryCountResponse>

  /**
   * Fetch sorround contents
   */
  withSurround(query: string | ContentQueryBuilderWhere, options?: Partial<{ before: number; after: number }>): ContentQueryBuilder<T, ContentQueryWithSurround<T>>

  /**
   * Fetch sorround contents
   */
  withDirConfig(): ContentQueryBuilder<T, ContentQueryWithDirConfig>
}


export type ContentQueryFetcher<T> = (query: ContentQueryBuilder<T>) => Promise<ContentQueryResponse>

