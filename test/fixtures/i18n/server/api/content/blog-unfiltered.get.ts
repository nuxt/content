import { eventHandler } from 'h3'

export default eventHandler(async (event) => {
  // Server queries must return every locale unless `.locale()` is called, even
  // with the context `@nuxtjs/i18n` attaches to each request
  event.context.nuxtI18n = { vueI18nOptions: { locale: 'en' } }

  return await queryCollection(event, 'blog').all()
})
