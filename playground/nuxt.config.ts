export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/ui', '@nuxthub/core'],
  extends: ['@nuxt/ui-pro'],
  contentV3: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
  },
  uiPro: {
    content: {},
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
