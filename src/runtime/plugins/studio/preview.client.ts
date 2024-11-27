import type { PublicRuntimeConfig } from '@nuxt/content'
import { defineNuxtPlugin, useCookie, useRoute, useRuntimeConfig, getAppManifest } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const studioConfig: PublicRuntimeConfig['studio'] = useRuntimeConfig().public.studio || {}
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

    const manifest = await getAppManifest()
    // Disable prerendering for preview
    manifest.prerendered = []

    nuxtApp.hook('app:mounted', async () => {
      await import('../../internal/studio').then(({ mountPreviewUI, initIframeCommunication }) => {
        mountPreviewUI()
        initIframeCommunication()
      })
    })
  }
})
