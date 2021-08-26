import { reactive, toRefs } from '@nuxtjs/composition-api'
import { DocusSettings, DocusState, PermissiveContext, DocusAddonContext, DocusRuntimeInstance } from '../../types'
import {
  clientAsyncData,
  docusInit,
  useDocusStyle,
  useDocusAddons,
  useDocusApi,
  useDocusNavigation
} from './composables'

let docusInstance: DocusRuntimeInstance

/**
 * Create the $docus runtime injection instance.
 */
export const createDocus = async (
  context: PermissiveContext,
  settings: DocusSettings
): Promise<DocusRuntimeInstance<typeof settings['theme']>> => {
  // Nuxt instance proxy
  let $nuxt: any

  const { ssrContext, nuxtState = {}, route } = context

  // Prevent hydration mismatch: inject templateOptions from ssr payload before page load
  const templateOptions = nuxtState.data?.[0].templateOptions || {}

  // State
  const state = reactive({
    currentPath: `/${route.params.pathMatch}`,
    currentPage: null,
    settings: null,
    theme: null,
    navigation: {},
    layout: {
      ...settings.layout,
      ...templateOptions
    }
  }) as DocusState

  // Split theme & user settings
  const { theme, ...userSettings } = settings
  state.settings = userSettings
  state.theme = theme

  // Create API helpers
  const api = useDocusApi(context)

  // Create Docus Addons context
  const docusAddonContext: DocusAddonContext = {
    ssrContext,
    $nuxt,
    context,
    state,
    settings,
    api
  }

  // Docus default addons
  const docusAddons = {
    useDocusStyle,
    useDocusNavigation
  }

  // Addons manager
  const { setupAddons, addonsContext } = useDocusAddons(docusAddonContext, docusAddons)

  // Setup addons
  await setupAddons()

  // Init Docus for every context
  docusInit(docusAddonContext)

  // Workaround for async data
  clientAsyncData($nuxt)

  docusInstance = {
    ...toRefs(state),
    ...api,
    ...addonsContext
  }

  return docusInstance
}

export const useDocus = () => {
  if (!docusInstance) throw new Error('Docus not yet initialized! useDocus has to be used in a living Vue instance.')

  return docusInstance
}
