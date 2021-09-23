import { NavItem, NavItemNavigationConfig } from '@docus/core'
import { NuxtConfig } from '@nuxt/kit'

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
 * CONTEXT
 *
 */

export interface DocusState {
  /**
   * Whether or not the app is running in preview mode.
   */
  preview: string | false
  /**
   * Any key.
   */
  [key: string]: any
}

/**
 *
 * THEME
 *
 */

export interface DefaultThemeConfig {
  [key: string]: any
}

export interface ThemeNuxtConfig extends NuxtConfig {
  /**
   * Like `rootDir` but for the theme.
   * You can use `__dirname` in a vast majority of cases.
   */
  themeDir: string
  /**
   * The theme name to be displayed for users.
   */
  themeName: string
}

export interface DocusTheme<T = DefaultThemeConfig> {
  /**
   * A valid ThemeNuxtConfig to be imported by Docus.
   */
  nuxtConfig: ThemeNuxtConfig
  /**
   * The default theme config to be merged with the user one.
   */
  themeConfig: T
  /**
   * A wrapper to define this theme config with type safety.
   */
  defineThemeConfig: (config: T) => T
}

/**
 *
 * NAVIGATION
 *
 */

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
