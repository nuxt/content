import type { DefaultThemeConfig, DocusConfig, DocusContext } from 'types'
import { Context } from '@nuxt/types'
// @ts-ignore
import { clientAsyncData, detectPreview, normalizePreviewScope } from './helpers'
import { createDocusNavigation, useNavigation } from './navigation'
import { createDocusStyles } from './style'
import { computed, reactive } from '#app'
export { useNavigation } from './navigation'
export { useStyles } from './style'

// $content proxy
let content: Context['$content']

const docusState = reactive<DocusContext>({
  config: {
    preview: false
  },
  theme: {},
  layout: {},
  currentPage: undefined
})

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

  const { $content, nuxtState = {} } = context

  // Set $content proxy
  content = $content

  // Prevent hydration mismatch: inject templateOptions from SSR payload before page load
  const templateOptions = nuxtState.data?.[0].templateOptions || {}

  // Set Docus settings
  docusState.config = { ..._config.docusConfig }

  // Detect preview mode
  docusState.config.preview = detectPreview(context)

  // Set Docus theme
  docusState.theme = { ..._config.themeConfig }

  // Init layout from settings and template options
  docusState.layout = {
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
    state: useDocus(),
    content: useContent(),
    config: useConfig(),
    theme: useTheme(),
    layout: useLayout(),
    page: usePage(),
    navigation: useNavigation()
  }

  // Inject $docus inside app
  inject('docus', $docus)

  // Inject $docus into window
  if (process.client) window.$docus = $docus

  // Initialize navigation
  await $docus.navigation.fetchNavigation()
}

// Default error message for Docus helpers.
const ERROR_MESSAGE = 'Docus not yet initialized! Docus helpers has to be used in a living Vue instance.'

const createStateComputed = (key: keyof DocusContext) =>
  computed({
    get: () => docusState[key],
    set: (newVal: any) => (docusState[key] = newVal)
  })

/**
 * Access the Docus state.
 */
export const useDocus = () => {
  if (!docusState) throw new Error(ERROR_MESSAGE)

  return docusState
}

/**
 * Access the content querying functions.
 */
export const useContent = () => {
  return docusState.config.preview
    ? (content as any).preview(normalizePreviewScope(docusState.config.preview))
    : content
}

/**
 * Access the config object.
 */
export const useConfig = () => {
  if (!docusState.config) throw new Error(ERROR_MESSAGE)

  return createStateComputed('config')
}

/**
 * Access the theme config object.
 */
export const useTheme = () => {
  if (!docusState.theme || !docusState.theme) throw new Error(ERROR_MESSAGE)

  return createStateComputed('theme')
}

/**
 * Access the layout config object.
 */
export const useLayout = () => {
  if (!docusState.layout) throw new Error(ERROR_MESSAGE)

  return createStateComputed('layout')
}

/**
 * Access the current page object.
 */
export const usePage = () => {
  return createStateComputed('currentPage')
}
