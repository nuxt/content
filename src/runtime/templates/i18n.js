export default function ({ app }, inject) {
  if (process.client) {
    app.i18n.onLanguageSwitched = () => {
      window.$nuxt.$docus.fetchNavigation()
    }
  }

  // Generate local path for static contents.
  // This helper does not respect `router.trailingSlash`
  // and add/remove trailingSlash baded on original path
  inject('contentLocalePath', path => {
    const { localeCodes, defaultLocale } = app.i18n

    /**
     * If `path` includes a locale do not change the locale
     */
    let localePath = localeCodes.some(code => path.startsWith(`/${code}`)) ? path : app.localePath(path)

    /**
     * Remove default locale from path
     */
    if (localePath.startsWith(`/${defaultLocale}`)) {
      localePath = localePath.replace(`/${defaultLocale}`, '')
    }

    /**
     * Preserve trailing slash in generated path
     */
    if (path.endsWith('/') && !localePath.endsWith('/')) {
      localePath += '/'
    }

    /**
     * Remove trailing slash from generated path
     */
    if (!path.endsWith('/') && localePath.endsWith('/')) {
      localePath = localePath.replace(/\/*$/, '')
    }
    return localePath
  })
}
