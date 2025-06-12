import type { PublicRuntimeConfig } from '@nuxt/content'
import { defineNuxtPlugin, useCookie, useRoute, useRuntimeConfig, getAppManifest } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const previewConfig: PublicRuntimeConfig['preview'] = useRuntimeConfig().public.preview || {}
  const route = useRoute()
  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

  if (previewConfig.api) {
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
    // @ts-expect-error not exposed in runtimeConfig
    window.sessionStorage.setItem('previewAPI', (typeof route.query.staging !== 'undefined' && previewConfig.stagingApi) ? previewConfig.stagingApi : previewConfig.api)

    // Disable prerendering for preview
    const manifest = await getAppManifest()
    manifest.prerendered = []

    nuxtApp.hook('app:mounted', async () => {
      await import('../internal/preview').then(({ mountPreviewUI, initIframeCommunication }) => {
        mountPreviewUI()
        initIframeCommunication()
      })
    })
  }
})
