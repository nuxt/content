import { eventHandler } from 'h3'

export default eventHandler(async (event) => {
  // Same shape `@nuxtjs/i18n` attaches to every request. Server queries must not
  // derive a locale from it: they return every locale unless `.locale()` is called.
  event.context.nuxtI18n = { vueI18nOptions: { locale: 'en' } }

  return await queryCollection(event, 'blog').all()
})
