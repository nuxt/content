export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxthub/core',
    '@nuxt/content',
  ],
  content: {
    experimental: {
      nativeSqlite: true,
    },
    // Uncomment to use PGlite instead of SQLite
    // database: {
    //   type: 'pglite',
    //   dataDir: '.data/content/pglite' // or omit for in-memory database
    // },
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
  compatibilityDate: '2025-10-15',
  hub: {
    database: 'sqlite',
    // Or use PGlite with NuxtHub:
    // database: 'postgresql',
  },
})
