import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const { locale, fallback } = getQuery(event) as { locale?: string, fallback?: string }

  const navigation = queryCollectionNavigation(event, 'blog')
  if (locale) {
    navigation.locale(locale, fallback ? { fallback } : undefined)
  }

  return await navigation
})
