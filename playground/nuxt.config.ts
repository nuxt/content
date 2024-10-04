export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
    '@nuxthub/core',
  ],
  extends: ['@nuxt/ui-pro'],
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
    'components:extend': (components) => {
      const globals = components.filter(c => [
        'UCallout',
        'UAlert',
      ].includes(c.pascalName))

      globals.forEach(c => c.global = 'sync')
    },
  },
})
