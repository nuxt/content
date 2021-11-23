import type { MDCOptions, MDCRoot, Toc } from '@docus/mdc'

import type { NuxtConfig } from '@nuxt/kit'

import type { MetaInfo } from 'vue-meta'

export * from '@docus/mdc'

declare module '#docus'

/**
 * Shim modules for NuxtOptions
 */
declare module '@nuxt/schema' {
  interface NuxtOptions {
    bridge: any
    colorMode: any
    image: any
    nitro: any
    i18n: any
    content: any
  }
}

export interface DocusOptions {
  apiBase: string
  watch: boolean
  dirs: Array<string | string[]>
  ignoreList?: string[]
  locales: {
    codes: string[]
    defaultLocale: string
  }
  database: {
    provider: string
    options: Record<string, any>
  }
  search: {
    inheritanceFields: string[]
  }
  transformers: {
    markdown: Partial<MDCOptions>
  }
}

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
  sortBy?: string[]
  skip?: number
  limit?: number
  only?: string[] | string
  without?: string[] | string
  where?: any
  surround?: string[]
  deep?: boolean
  text?: boolean
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

export interface NavItemNavigationConfig {
  /**
   * Navigation title
   */
  title: string
  /**
   * If set to `false`, the nested pages will not display in Docus navigation menus
   */
  nested: boolean
  /**
   * If set to `true`, other pages will not show in the left menu when user visiting the page or its nested pages.
   */
  exclusive: boolean
  /**
   * If set to `true` in an `index.md`, the category will be collapsed by default in aside navigation.
   */
  collapse: boolean
  /**
   * If set in an `index.md`, the page will redirect to the specified path when loaded, can be useful for empty categories pages.
   */
  redirect: string
}

export interface DocusDocument {
  // FrontMatter
  title: string
  description: string
  badge: string
  version: number
  fullscreen: boolean
  head: MetaInfo
  position: string
  draft: boolean
  // Navigation
  navigation: NavItemNavigationConfig | false
  // url of nearest exclusive parent
  // parent uses to filter pages to find currect previous and next page
  parent: string
  // Template
  template: {
    self: string
    nested: string
    [key: string]: any
  }
  // Layout
  layout: {
    header: boolean
    footer: boolean
    aside: boolean
    asideClass: string
    fluid: boolean
    [key: string]: any
  }

  // Generated
  /**
   * If set to `false` the document will not render as a standalone page an can only accessible with `InjectContent` of `$docus` search API
   */
  page: boolean
  /**
   * It will set to `false` if the file does not containts any markdown content
   */
  empty: boolean
  /**
   * The unique key of document (file path)
   */
  key: string
  /**
   * Path of document in the storage.
   */
  path: string
  /**
   * Generated url of document. This url will be used to create anchor links of document.
   */
  to: string
  /**
   * File extension
   */
  extension: string
  slug: string
  toc: false | Toc
  language: string
  body: MDCRoot
  dir: string
  createdAt: Date
  updatedAt: Date
}

export interface NavItem extends NavItemNavigationConfig {
  /**
   * Page slug
   */
  slug: string
  /**
   * full path of page
   */
  to: string
  /**
   * Shows if the page is draft or not
   */
  draft?: boolean
  /**
   * Provide template name that should use to render the page
   */
  template?: string
  /**
   * Shows if this nav belogs to a real page or not
   */
  page: boolean
  /**
   * Small Icon that shows before page title
   */
  icon?: string
  /**
   * If set to `false`, the page will not show in navigation menus
   */
  hidden: boolean
  /**
   * Child pages
   */
  children: NavItem[]

  [key: string]: any
}

/**
 *
 * APP
 *
 */

export interface DocusConfig {
  /**
   * The website title.
   */
  title?: string
  /**
   * Your content dir.
   * @default content
   */
  contentDir?: string
  /**
   * Your website description to be used in <head>.
   */
  description?: string
  /**
   * Your website URL.
   */
  url?: string
  /**
   * The default template to use.
   * @default page
   */
  template?: string
  /**
   * Your theme path or module name.
   */
  theme?: string
  /**
   * Any key useful to your app.
   */
  [key: string]: any
}

/**
 *
 * THEME
 *
 */

export interface ThemeConfig {
  /**
   * The theme name to be displayed for users.
   */
  name?: string
  /**
   * The theme config is by definition permissive.
   */
  [key: string]: any
}

/**
 *
 * NAVIGATION
 *
 */

export type DocusNavigationState = { [language: string]: NavItem[] }

export type DocusCurrentNav = {
  /**
   * The current page title.
   */
  title?: string
  /**
   * The current path.
   */
  to?: string
  /**
   * The current nav.
   */
  navigation?: NavItemNavigationConfig | false
  /**
   * The parent nav.
   */
  parent?: NavItem
  /**
   * The current navigation links.
   */
  links: NavItem[]
}

export interface DocusNavigationGetParameters {
  /**
   * Depth to which the navigation should be queried.
   */
  depth?: number
  /**
   * Locale in which the navigation should be queried.
   */
  locale?: string
  /**
   * A path from which the navigation should be queried.
   */
  from?: string
  /**
   * Whether or not the regular filters (exclusive, draft...) should be applied to the query.
   * @default false
   */
  all?: boolean
}

/**
 *
 * MISCELLANOUS
 *
 */

export interface Colors {
  [key: string]: string | Colors
}

export interface DocusRuntimeInstance {
  content: ReturnType<typeof useDocusContent>
  config: ReturnType<typeof useDocusConfig>
  theme: ReturnType<typeof useDocusTheme>
  layout: ReturnType<typeof useDocusLayout>
  page: ReturnType<typeof useDocusPage>
  navigation: ReturnType<typeof useDocusNavigation>
}

export * from './dist'
