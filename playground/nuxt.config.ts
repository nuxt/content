export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui-pro',
    '@nuxthub/core',
  ],
  content: {
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
  mdc: {
    highlight: {
      theme: {
        light: 'material-theme-lighter',
        default: 'material-theme',
        dark: 'material-theme-palenight',
      },
    },
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
})
