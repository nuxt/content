import type { DefaultThemeConfig, DocusConfig } from 'types'
import type { DocusContent, DocusDocument } from '@docus/core'
import type { Context } from '@nuxt/types'
// @ts-ignore
import { clientAsyncData, detectPreview, normalizePreviewScope } from './helpers'
import { createDocusNavigation, useNavigation } from './navigation'
import { createDocusStyles } from './style'
import type { Ref } from '#app'
import { useState } from '#app'
export { useNavigation } from './navigation'
export { useStyles } from './style'

// $content proxy
let content: DocusContent<any>

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
export const createDocus = async (
  context: Context,
  _config: { docusConfig: DocusConfig; themeConfig: DefaultThemeConfig },
  inject: (key: string, value: any) => void
) => {
  // Nuxt instance proxy
  let $nuxt: any

  // @ts-ignore
  const { $content, nuxtState = {} } = context

  // Set $content proxy
  content = $content

  const docusConfig = useState(StateTypes.Config) as Ref<DocusConfig>

  const docusTheme = useState(StateTypes.Theme) as Ref<DefaultThemeConfig>

  const docusLayout = useState(StateTypes.Layout) as Ref<DefaultThemeConfig['layout']>

  const docusCurrentPage = useState(StateTypes.CurrentPage) as Ref<DocusDocument>

  // Prevent hydration mismatch: inject templateOptions from SSR payload before page load
  const templateOptions = nuxtState.data?.[0].templateOptions || {}

  // Set Docus settings
  docusConfig.value = { ..._config.docusConfig, preview: detectPreview(context) }

  // Set Docus theme
  docusTheme.value = { ..._config.themeConfig }

  // Init layout from settings and template options
  docusLayout.value = {
    ...(_config.themeConfig?.layout || {}),
    ...templateOptions
  }

  // Create Docus styling
  createDocusStyles(context)

  // Workaround for async data
  clientAsyncData($nuxt)

  // Create Docus navigation
  createDocusNavigation(context)

  // Create $docus
  const $docus = {
    config: docusConfig,
    content,
    theme: docusTheme,
    layout: docusLayout,
    page: docusCurrentPage,
    navigation: useNavigation()
  }

  // Inject $docus inside app
  inject('docus', $docus)

  // Inject $docus into window
  if (process.client) window.$docus = $docus

  // Initialize navigation
  await $docus.navigation.fetchNavigation()
}

/**
 * Access the Docus state.
 */
export const useDocus = () => ({
  config: useState(StateTypes.Config) as Ref<DocusConfig>,
  content,
  theme: useState(StateTypes.Theme) as Ref<DefaultThemeConfig>,
  layout: useState(StateTypes.Layout) as Ref<DefaultThemeConfig['layout']>,
  page: useState(StateTypes.CurrentPage) as Ref<DocusDocument>,
  navigation: useNavigation()
})

/**
 * Access the content querying functions.
 */
export const useContent = () => {
  const preview = useState(StateTypes.Config).value.preview || false

  return preview ? content.preview(normalizePreviewScope(preview)) : content
}

/**
 * Access the config object.
 */
export const useConfig = () => useState(StateTypes.Config) as Ref<DocusConfig>

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
