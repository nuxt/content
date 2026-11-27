import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const { path, locale, fallback } = getQuery(event) as { path?: string, locale?: string, fallback?: string }

  let query = queryCollection(event, 'blog')

  if (locale) {
    query = query.locale(locale, fallback ? { fallback } : undefined)
  }

  if (path) {
    query = query.path(path)
  }

  return await query.first()
})
