export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui-pro',
    '@nuxthub/core',
  ],
  content: {
    database: {
      type: 'd1',
      binding: 'DB',
    },
    build: {
      markdown: {
        highlight: {
          theme: {
            dark: 'aurora-x', // Theme containing italic
            default: 'github-light',
          },
        },
      },
    },
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
