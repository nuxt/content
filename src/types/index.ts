import { NavItem, NavItemNavigationConfig } from '@docus/core'
import { NuxtConfig } from '@nuxt/kit'

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

export interface Colors {
  [key: string]: string | Colors
}

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
