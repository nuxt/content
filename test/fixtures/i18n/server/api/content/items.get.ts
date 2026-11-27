import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const { collection, locale, fallback } = getQuery(event) as { collection: 'pages' | 'settings', locale?: string, fallback?: string }

  const query = queryCollection(event, collection)
  if (locale) {
    query.locale(locale, fallback ? { fallback } : undefined)
  }

  return await query.all()
})
