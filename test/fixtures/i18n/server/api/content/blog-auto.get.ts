import { eventHandler, getQuery } from 'h3'

// Exercises server-side auto-locale detection without @nuxtjs/i18n installed by
// faking the per-request context the module reads. No explicit `.locale()` call
// is made, so the result reflects automatic detection from `event.context.nuxtI18n`.
export default eventHandler(async (event) => {
  const { locale } = getQuery(event) as { locale?: string }

  if (locale) {
    event.context.nuxtI18n = { detectLocale: locale }
  }

  return await queryCollection(event, 'blog').all()
})
