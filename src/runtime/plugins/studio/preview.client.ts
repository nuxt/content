import { mountPreviewUI, initIframeCommunication } from '../../internal/studio'
import { defineNuxtPlugin, useCookie, useRoute, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const studioConfig = useRuntimeConfig().public.studio || {}
  const route = useRoute()
  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

  if (studioConfig.apiURL) {
    // Do not enable preview if preview token is missing in query params
    if (Object.prototype.hasOwnProperty.call(route.query, 'preview') && !route.query.preview) {
      return
    }

    if (!route.query.preview && !previewToken.value) {
      return
    }

    if (route.query.preview) {
      previewToken.value = String(route.query.preview)
    }

    window.sessionStorage.setItem('previewToken', String(previewToken.value))
    window.sessionStorage.setItem('previewAPI', typeof route.query.staging !== 'undefined' ? 'https://dev-api.nuxt.studio' : studioConfig.apiURL)

    nuxtApp.hook('app:mounted', async () => {
      mountPreviewUI()
      initIframeCommunication()
    })
  }
})
