export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxthub/core',
  ],
  content: {
    experimental: {
      nativeSqlite: true,
    },
    build: {
      markdown: {
        remarkPlugins: {
          'remark-code-import': {},
        },
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
