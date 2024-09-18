export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui', '@nuxthub/core'],
  contentV3: {
    database: 'd1',
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
