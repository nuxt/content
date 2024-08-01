export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/mdc', '@nuxthub/core'],
  myModule: {},
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
