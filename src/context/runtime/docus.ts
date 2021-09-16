import { ssrRef, Ref } from '@nuxtjs/composition-api'
import { withLeadingSlash } from 'ufo'
import { DocusSettings, PermissiveContext, DocusAddonContext, DocusInstance } from '../../types'
import { clientAsyncData, useDocusStyle, useDocusAddons, useDocusNavigation } from './composables'

const docusInstance = ssrRef<DocusInstance>({}, 'docusInstance')

/**
 * Create the $docus runtime injection instance.
 */
export const createDocus = async (context: PermissiveContext, settings: DocusSettings): Promise<Ref<DocusInstance>> => {
  // Nuxt instance proxy
  let $nuxt: any

  const { $content, $config, ssrContext, nuxtState = {}, route, params } = context

  // Prevent hydration mismatch: inject templateOptions from SSR payload before page load
  const templateOptions = nuxtState.data?.[0].templateOptions || {}

  // Split theme & user settings
  const { theme, ...userSettings } = settings

  // Detect & Prepare preview mode
  const path = withLeadingSlash(params.pathMatch || route.path || '/')
  const preview = context.$config?._app?.basePath === '/_preview/' || path.startsWith('/_preview')
  const basePath = preview ? '/_preview/' : '/'
  if ($config?._app?.basePath) {
    $config._app.basePath = basePath
  }
  if (ssrContext?.runtimeConfig?.public?._app?.basePath) {
    ssrContext.runtimeConfig.public._app.basePath = basePath
  }

  // Create default Docus instance
  docusInstance.value = {
    preview,
    content: $content,
    currentPath: `/${route.params.pathMatch}`,
    currentPage: undefined,
    settings: userSettings,
    theme,
    layout: {
      ...settings.layout,
      ...templateOptions
    }
  }

  // Create Docus Addons context
  const docusAddonContext: DocusAddonContext = {
    context,
    ssrContext,
    instance: docusInstance.value
  }

  // Docus default addons
  const docusAddons = {
    style: useDocusStyle,
    navigation: useDocusNavigation
  }

  // Addons manager
  const { setupAddons, addonsContext } = useDocusAddons(docusAddonContext, docusAddons)

  // Setup addons
  await setupAddons()

  // Update Docus instance with addons
  docusInstance.value = {
    ...docusInstance.value,
    ...addonsContext
  }

  // Workaround for async data
  clientAsyncData($nuxt)

  return docusInstance
}

// Default error message for Docus helpers.
const ERROR_MESSAGE = 'Docus not yet initialized! Docus helpers has to be used in a living Vue instance.'

export const useDocus = () => {
  if (!docusInstance) throw new Error(ERROR_MESSAGE)

  return docusInstance.value
}

export const useNavigation = () => {
  if (!docusInstance || !docusInstance.value || !docusInstance.value.navigation) throw new Error(ERROR_MESSAGE)

  return docusInstance.value.navigation
}

export const useContent = () => {
  if (!docusInstance || !docusInstance.value || !docusInstance.value.content) throw new Error(ERROR_MESSAGE)

  return docusInstance.value.preview ? docusInstance.value.content.preview() : docusInstance.value.content
}

export const useSettings = () => {
  if (!docusInstance || !docusInstance.value || !docusInstance.value.settings) throw new Error(ERROR_MESSAGE)

  return docusInstance.value.settings
}

export const useTheme = () => {
  if (!docusInstance || !docusInstance.value || !docusInstance.value.theme) throw new Error(ERROR_MESSAGE)

  return docusInstance.value.theme
}

export const useLayout = () => {
  if (!docusInstance || !docusInstance.value || !docusInstance.value.layout) throw new Error(ERROR_MESSAGE)

  return docusInstance.value.layout
}
