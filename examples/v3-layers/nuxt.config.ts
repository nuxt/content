// The project extends the docs layer. Nuxt Content loads the `content.config.ts`
// of every layer: the layer contributes `landing_<locale>` + `docs_<locale>`, this
// project adds `changelog_<locale>`. Both configs read the i18n locales through
// `useNuxt()`. A collection defined here with the same name would override the layer's.
export default defineNuxtConfig({
  extends: ['./layer'],
  modules: ['@nuxtjs/i18n'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  nitro: {
    prerender: {
      routes: ['/en', '/fr'],
      crawlLinks: true,
    },
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
    ],
  },
})
