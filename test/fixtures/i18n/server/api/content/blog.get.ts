import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const { locale, fallback } = getQuery(event) as { locale?: string, fallback?: string }

  let query = queryCollection(event, 'blog')

  if (locale) {
    query = query.locale(locale, fallback ? { fallback } : undefined)
  }

  return await query.all()
})
