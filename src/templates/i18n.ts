import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxt: any) => {
  // Generate local path for static contents.
  // This helper does not respect `router.trailingSlash`
  // and add/remove trailingSlash baded on original path
  nuxt.provide('contentLocalePath', (path: string) => {
    const { localeCodes, defaultLocale } = nuxt.app.i18n

    // If `path` includes a locale do not change the locale
    let localePath = localeCodes.some((code: string) => path.startsWith(`/${code}`)) ? path : nuxt.app.localePath(path)

    // Remove default locale from path
    if (localePath.startsWith(`/${defaultLocale}`)) {
      localePath = localePath.replace(`/${defaultLocale}`, '')
    }

    // Preserve trailing slash in generated path
    if (path.endsWith('/') && !localePath.endsWith('/')) {
      localePath += '/'
    }

    // Remove trailing slash from generated path
    if (!path.endsWith('/') && localePath.endsWith('/')) {
      localePath = localePath.replace(/\/*$/, '')
    }

    return localePath
  })

  if (process.client) {
    nuxt.nuxt2Context.i18n.onLanguageSwitched = () => {
      window.$docus.navigation.fetchNavigation(nuxt.nuxt2Context.i18n.locale)
    }
  }
})
