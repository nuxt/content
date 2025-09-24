// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui-pro', '@nuxtjs/i18n', '@nuxt/content', '@nuxthub/core'],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  i18n: {
    locales: [
      { code: 'en', name: 'English', language: 'en-US', dir: 'ltr' },
      { code: 'fr', name: 'French', language: 'fr-FR' },
      { code: 'fa', name: 'Farsi', language: 'fa-IR', dir: 'rtl' },
    ],
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
  },
})
