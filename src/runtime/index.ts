import type { DocusContent, DocusDocument } from '@docus/core'
import type { DefaultThemeConfig, DocusConfig } from 'types'
import { clientAsyncData, detectPreview, normalizePreviewScope } from './helpers'
import { createDocusNavigation, useNavigation } from './navigation'
import { createDocusStyles } from './style'
import { NuxtAppCompat, Ref, useNuxtApp, useState } from '#app'
export { useNavigation } from './navigation'
export { useStyles } from './style'

// State ids for Docus runtime API
export enum StateTypes {
  Config = 'docus-config',
  Theme = 'docus-theme',
  Layout = 'docus-layout',
  CurrentPage = 'docus-current-page',
  Navigation = 'docus-navigation',
  CurrentNav = 'docus-current-nav',
  CurrentPath = 'docus-current-path',
  CurrentLocale = 'docus-current-locale'
}

/**
 * Create the $docus runtime injection instance.
 */
export const createDocus = (
  nuxtApp: NuxtAppCompat,
  _config: { docusConfig: DocusConfig; themeConfig: DefaultThemeConfig }
) => {
  // TODO: Do not depend on nuxt2 legacy context and use nuxtApp inteface everywhere without destructure
  const $nuxt = (nuxtApp.nuxt2Context as any).app

  // Docus config
  const docusConfig = useState(StateTypes.Config, () => ({
    ..._config.docusConfig,
    preview: detectPreview($nuxt.context)
  })) as Ref<DocusConfig>

  // Activate Docus preview mode for _.vue (cannot use CAPI yet)
  if (docusConfig.value.preview) {
    $nuxt.$content = $nuxt.$content.preview(docusConfig.value.preview)
  }

  // Docus Theme config
  const docusTheme = useState(StateTypes.Theme, () => ({ ..._config.themeConfig })) as Ref<DefaultThemeConfig>

  // Docus layout
  const docusLayout = useState(StateTypes.Layout, () => _config.themeConfig?.layout || {}) as Ref<
    DefaultThemeConfig['layout']
  >

  // Docus current page (initialized in _.vue > asyncData)
  const docusCurrentPage = useState(StateTypes.CurrentPage) as Ref<DocusDocument>

  // Docus current locale
  const docusCurrentLocale = useState(StateTypes.CurrentLocale, () => $nuxt.context.app.i18n.locale) as Ref<string>

  // Create Docus styling
  createDocusStyles($nuxt.context)

  // Workaround for async data
  clientAsyncData($nuxt)

  // Create Docus navigation
  createDocusNavigation($nuxt.context, docusConfig, $nuxt.$content, docusCurrentLocale)

  // Create $docus
  const $docus = {
    currentLocale: docusCurrentLocale,
    config: docusConfig,
    content: $nuxt.$content,
    theme: docusTheme,
    layout: docusLayout,
    page: docusCurrentPage,
    navigation: useNavigation()
  }

  return {
    $docus,
    init: async () => {
      await $docus.navigation.fetchNavigation()
      $docus.navigation.updateCurrentNav()
    }
  }
}

/**
 * Access the Docus runtime API.
 */
export const useDocus = () => ({
  content: useNuxtApp().vue2App.$content as DocusContent<any>,
  currentLocale: useState(StateTypes.CurrentLocale) as Ref<string>,
  config: useState(StateTypes.Config) as Ref<DocusConfig>,
  theme: useState(StateTypes.Theme) as Ref<DefaultThemeConfig>,
  layout: useState(StateTypes.Layout) as Ref<DefaultThemeConfig['layout']>,
  page: useState(StateTypes.CurrentPage) as Ref<DocusDocument>,
  navigation: useNavigation()
})

/**
 * Access the content querying functions.
 */
export const useContent = () => {
  const $content = useNuxtApp().vue2App.$content as DocusContent<any>

  const preview = (useState(StateTypes.Config) as Ref<DocusConfig>).value.preview || false

  return preview ? $content.preview(normalizePreviewScope(preview)) : $content
}

/**
 * Access the config object.
 */
export const useConfig = () => useState(StateTypes.Config) as Ref<DocusConfig>

/**
 * Access the current locale.
 */
export const useCurrentLocale = () => useState(StateTypes.CurrentLocale) as Ref<string>

/**
 * Access the theme config object.
 */
export const useTheme = () => useState(StateTypes.Theme) as Ref<DefaultThemeConfig>

/**
 * Access the layout config object.
 */
export const useLayout = () => useState(StateTypes.Layout) as Ref<DefaultThemeConfig['layout']>

/**
 * Access the current page object.
 */
export const usePage = () => useState(StateTypes.CurrentPage) as Ref<DocusDocument>
