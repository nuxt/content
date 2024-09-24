export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui', '@nuxthub/core'],
  contentV3: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
