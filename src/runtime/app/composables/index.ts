import { clientAsyncData, detectPreview, normalizePreviewScope } from './helpers'
import { createDocusNavigation, useDocusNavigation } from './navigation'
import { createDocusStyles } from './style'
import type { ThemeConfig, DocusConfig, DocusContent, DocusDocument } from 'types'
import { NuxtAppCompat, Ref, useNuxtApp, useState } from '#app'
export { useDocusStyles } from './style'

// State ids for Docus runtime API
export enum StateTypes {
  Config = 'docus-config',
  Theme = 'docus-theme',
  Layout = 'docus-layout',
  CurrentPage = 'docus-current-page',
  Navigation = 'docus-navigation',
  CurrentNav = 'docus-current-nav',
  CurrentPath = 'docus-current-path'
}

/**
 * Create the $docus runtime injection instance.
 */
export const createDocus = (
  nuxtApp: NuxtAppCompat,
  _config: { docusConfig: DocusConfig; themeConfig: ThemeConfig }
) => {
  // TODO: Do not depend on nuxt2 legacy context and use nuxtApp inteface everywhere without destructure
  const $nuxt = (nuxtApp.nuxt2Context as any).app

  // Docus config
  const docusConfig = useState(StateTypes.Config, () => ({
    ..._config.docusConfig,
    preview: detectPreview($nuxt.context)
  })) as Ref<DocusConfig>

  // Activate Docus preview mode for _.vue (cannot use CAPI yet)
  if (docusConfig.value.preview) $nuxt.$content = $nuxt.$content.preview(docusConfig.value.preview)

  // Docus Theme config
  const docusTheme = useState(StateTypes.Theme, () => ({ ..._config.themeConfig })) as Ref<ThemeConfig>

  // Docus layout
  const docusLayout = useState(StateTypes.Layout, () => _config.themeConfig?.layout || {}) as Ref<ThemeConfig['layout']>

  // Docus current page (initialized in _.vue > asyncData)
  const docusCurrentPage = useState(StateTypes.CurrentPage) as Ref<DocusDocument>

  // Create Docus styling
  createDocusStyles($nuxt.context)

  // Workaround for async data
  clientAsyncData($nuxt)

  // Create Docus navigation
  createDocusNavigation($nuxt.context, docusConfig, $nuxt.$content)

  // Create $docus
  const $docus = {
    config: docusConfig,
    content: $nuxt.$content,
    theme: docusTheme,
    layout: docusLayout,
    page: docusCurrentPage,
    navigation: useDocusNavigation()
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
  config: useState(StateTypes.Config) as Ref<DocusConfig>,
  theme: useState(StateTypes.Theme) as Ref<ThemeConfig>,
  layout: useState(StateTypes.Layout) as Ref<ThemeConfig['layout']>,
  page: useState(StateTypes.CurrentPage) as Ref<DocusDocument>,
  navigation: useDocusNavigation()
})

/**
 * Access the content querying functions.
 */
export const useDocusContent = () => {
  const $content = useNuxtApp().vue2App.$content as DocusContent<any>

  const preview = (useState(StateTypes.Config) as Ref<DocusConfig>).value.preview || false

  return preview ? $content.preview(normalizePreviewScope(preview)) : $content
}

/**
 * Access the config object.
 */
export const useDocusConfig = () => useState(StateTypes.Config) as Ref<DocusConfig>

/**
 * Access the theme config object.
 */
export const useDocusTheme = () => useState(StateTypes.Theme) as Ref<ThemeConfig>

/**
 * Access the layout config object.
 */
export const useDocusLayout = () => useState(StateTypes.Layout) as Ref<ThemeConfig['layout']>

/**
 * Access the current page object.
 */
export const useDocusPage = () => useState(StateTypes.CurrentPage) as Ref<DocusDocument>

export { useDocusNavigation } from './navigation'
