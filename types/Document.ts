import type { MetaInfo } from 'vue-meta'
import type { MDCRoot, Toc } from '@docus/mdc'

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
