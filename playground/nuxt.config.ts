export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/mdc', '@nuxthub/core'],
  contentV3: {
    database: 'd1',
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
