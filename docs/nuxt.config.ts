import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: '@nuxthq/elements',

  routeRules: {
    '/get-started': { redirect: '/get-started/installation' },
    '/api/configuration': { redirect: '/get-started/configuration' },
    '/guide/writing/document-driven': { redirect: '/get-started/document-driven' },
    '/guide/migration/edge-channel': { redirect: '/get-started/document-driven' },
    '/guide/migration/from-v1': { redirect: '/get-started/from-v1' },
    '/guide/deploy/node-server': { redirect: '/get-started/installation' },
    '/guide/deploy/static-hosting': { redirect: '/get-started/installation' },
    '/content-v1': { redirect: '/get-started/from-v1' },
    '/guide/writing/content-directory': { redirect: '/writing/content-directory' },
    '/guide/writing/markdown': { redirect: '/writing/markdown' },
    '/guide/writing/mdc': { redirect: '/writing/mdc' },
    '/guide/writing/json': { redirect: '/writing/json' },
    '/guide/writing/yaml': { redirect: '/writing/yaml' },
    '/guide/writing/csv': { redirect: '/writing/csv' },
    '/guide/writing/vue-components': { redirect: '/writing/vue-components' },
    '/guide/displaying/rendering': { redirect: '/usage/rendering' },
    '/guide/displaying/querying': { redirect: '/usage/querying' },
    '/guide/displaying/navigation': { redirect: '/usage/navigation' },
    '/guide/displaying/typescript': { redirect: '/usage/typescript' }
  },

  content: {
    // sources: {
    //   v1: {
    //     prefix: '/v1',
    //     driver: 'fs',
    //     base: resolve(__dirname, 'content-v1/en')
    //   },
    //   'v1-ja': {
    //     prefix: '/ja/v1',
    //     driver: 'fs',
    //     base: resolve(__dirname, 'content-v1/ja')
    //   },
    //   'v1-fr': {
    //     prefix: '/fr/v1',
    //     driver: 'fs',
    //     base: resolve(__dirname, 'content-v1/fr')
    //   },
    //   'v1-ru': {
    //     prefix: '/ru/v1',
    //     driver: 'fs',
    //     base: resolve(__dirname, 'content-v1/ru')
    //   }
    // },
    highlight: {
      preload: ['xml']
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/blog/announcing-v2',
        '/api/search.json'
      ],
      ignore: [
        '/fr/v1/getting-started/&quot;',
        '/ja/v1/getting-started/&quot;',
        '/ru/v1/getting-started/&quot;',
        '/v1/getting-started/&quot;'
      ]
    }
  },
  modules: [
    '@nuxt/image',
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxthq/studio',
    '@vueuse/nuxt',
    '@nuxtjs/fontaine',
    '@nuxtjs/google-fonts',
    'nuxt-og-image'
  ],

  colorMode: {
    preference: 'dark'
  },
  ui: {
    icons: ['heroicons', 'simple-icons', 'ph']
  },

  fontMetrics: {
    fonts: ['DM Sans']
  },

  googleFonts: {
    display: 'swap',
    download: true,
    families: {
      'DM+Sans': [400, 500, 600, 700]
    }
  },

  runtimeConfig: {
    public: {
      algolia: {
        applicationId: '',
        apiKey: '',
        langAttribute: 'lang',
        docSearch: {
          indexName: 'content-nuxtjs'
        }
      }
    }
  },

  hooks: {
    // Related to https://github.com/nuxt/nuxt/pull/22558
    // Adding all global components to the main entry
    // To avoid lagging during page navigation on client-side
    'components:extend': function (components) {
      for (const comp of components) {
        if (comp.global) { comp.global = 'sync' }
      }
    }
  }
})
