import type { DocusDocument } from '@docus/core'
import type { DefaultThemeConfig, DocusConfig, DocusState } from 'types'
import { ssrRef, useContext as _useContext } from '@nuxtjs/composition-api'
import { Context } from '@nuxt/types'
import { clientAsyncData, detectPreview, normalizePreviewScope } from './helpers'
import { createDocusNavigation } from './navigation'
import { createDocusStyles } from './style'
export { useNavigation } from './navigation'
export { useStyles } from './style'

// $content proxy
let content: Context['$content']

// Nuxt Context proxy
let _context: Context
// @ts-ignore
export const useContext = process.server ? () => _context : (_useContext as () => Context)

// Docus state
const state = ssrRef<DocusState>(
  {
    preview: false
  },
  'docus-state'
)

// Docus config (from docus.config)
const config = ssrRef<DocusConfig>({}, 'docus-settings')

// Docus theme config (from docus.config > `theme`)
const theme = ssrRef<DefaultThemeConfig>({}, 'docus-theme')

// Docus layout config (cascade from docus.config > template options > page settings)
const layout = ssrRef<{ [key: string]: any }>({}, 'docus-layout')

// Current page data
const currentPage = ssrRef<DocusDocument | undefined>(undefined, 'docus-current-page')

/**
 * Create the $docus runtime injection instance.
 */
export const createDocus = async (
  context: Context,
  _config: { docusConfig: DocusConfig; themeConfig: DefaultThemeConfig }
) => {
  // Nuxt instance proxy
  let $nuxt: any

  const { $content, nuxtState = {} } = context

  // Init context
  _context = context

  // Detect preview mode
  state.value.preview = detectPreview(context)

  // Set $content proxy
  content = $content

  // Prevent hydration mismatch: inject templateOptions from SSR payload before page load
  const templateOptions = nuxtState.data?.[0].templateOptions || {}

  // Set Docus settings
  config.value = { ..._config.docusConfig }

  // Set Docus theme
  theme.value = { ..._config.themeConfig }

  // Init layout from settings and template options
  layout.value = {
    ...config.value.layout,
    ...templateOptions
  }

  // Create Docus navigation
  await createDocusNavigation(context)

  // Create Docus styling
  createDocusStyles(context)

  // Workaround for async data
  clientAsyncData($nuxt)
}

// Default error message for Docus helpers.
const ERROR_MESSAGE = 'Docus not yet initialized! Docus helpers has to be used in a living Vue instance.'

/**
 * Access the Docus state.
 */
export const useDocus = () => {
  if (!state) throw new Error(ERROR_MESSAGE)

  return state
}

/**
 * Access the content querying functions.
 */
export const useContent = () => {
  return state.value.preview ? (content as any).preview(normalizePreviewScope(state.value.preview)) : content
}

/**
 * Access the config object.
 */
export const useConfig = () => {
  if (!config || !config.value) throw new Error(ERROR_MESSAGE)

  return config
}

/**
 * Access the theme config object.
 */
export const useTheme = () => {
  if (!theme || !theme.value) throw new Error(ERROR_MESSAGE)

  return theme
}

/**
 * Access the layout config object.
 */
export const useLayout = () => {
  if (!layout || !layout.value) throw new Error(ERROR_MESSAGE)

  return layout
}

/**
 * Access the current page object.
 */
export const usePage = () => {
  if (!currentPage) throw new Error(ERROR_MESSAGE)

  return currentPage
}
