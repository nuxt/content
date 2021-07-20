import { NavItemNavigationConfig } from './Document'

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

export type DocusNavigation = {
  [language: string]: NavItem[]
}

export type DocusCurrentNav = {
  title?: string
  to?: string
  navigation?: NavItemNavigationConfig | false
  parent?: NavItem
  links: NavItem[]
}

export interface DocusNavigationGetParameters {
  depth?: number
  locale?: string
  from?: string
  all?: boolean
}
