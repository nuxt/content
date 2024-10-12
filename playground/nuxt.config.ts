export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui-pro',
    '@nuxthub/core',
  ],
  // extends: ['@nuxt/ui-pro'],
  contentV3: {
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
  uiPro: {
    content: {},
  },
  compatibilityDate: '2024-07-24',
  hub: {
    database: true,
  },
  hooks: {
    // Related to https://github.com/nuxt/nuxt/pull/22558
    // Adding all global components to the main entry
    // To avoid lagging during page navigation on client-side
    'components:extend': (components) => {
      for (const comp of components) {
        if (comp.global) {
          comp.global = 'sync'
        }
      }
    },
  },
})
