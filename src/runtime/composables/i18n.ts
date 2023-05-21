export const useI18n = () => {
  const parseLocale = (_path) => {
    const { content } = useRuntimeConfig()
    const { defaultLocale, locales } = content

    let _locale = defaultLocale || locales[0]

    const pathArr = _path.split('/')
    const localeInPath = pathArr[1]
    if (locales.includes(localeInPath)) {
      _locale = localeInPath
      _path = pathArr.join('/').substring(`/${_locale}`.length)
    }

    return {
      _path,
      _locale
    }
  }

  const getLocaleSwitcherLinkList = (path) => {
    const { content } = useRuntimeConfig()
    const { defaultLocale, locales } = content
    const { _path } = parseLocale(path)
    return locales.map((locale) => {
      return {
        to: locale === defaultLocale ? _path : `/${locale}${_path}`,
        locale
      }
    })
  }

  return {
    parseLocale,
    getLocaleSwitcherLinkList
  }
}
