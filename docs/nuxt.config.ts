export default defineNuxtConfig({
  extends: '@nuxt/ui-pro',
  devtools: { enabled: true },

  routeRules: {
    // content.nuxtjs.org redirects
    '/get-started': { redirect: '/get-started/installation' },
    '/guide/writing/content-directory': { redirect: '/usage/content-directory' },
    '/guide/writing/markdown': { redirect: '/usage/markdown' },
    '/guide/writing/mdc': { redirect: '/usage/markdown' },
    '/guide/writing/json': { redirect: '/usage/files' },
    '/guide/writing/yaml': { redirect: '/writing/files' },
    '/guide/writing/csv': { redirect: '/writing/files' },
    '/guide/writing/document-driven': { redirect: '/document-driven/introduction' },
    '/guide/writing/vue-components': { redirect: '/usage/markdown#vue-components' },
    '/guide/displaying/rendering': { redirect: '/usage/render' },
    '/guide/displaying/querying': { redirect: '/composables/query-content' },
    '/guide/displaying/navigation': { redirect: '/usage/navigation' },
    '/guide/displaying/typescript': { redirect: '/usage/typescript' },
    '/guide/recipes/sitemap': { redirect: '/recipes/sitemap' },
    '/guide/deploy/node-server': { redirect: '/get-started/installation' },
    '/guide/deploy/static-hosting': { redirect: '/get-started/installation' },
    '/guide/migration/from-v1': { redirect: '/get-started/from-v1' },
    '/content-v1': { redirect: '/get-started/from-v1' },
    '/guide/migration/edge-channel': { redirect: '/get-started/edge-channel' },
    '/api/components/content-doc': { redirect: '/components/content-doc' },
    '/api/components/content-list': { redirect: '/components/content-list' },
    '/api/components/content-renderer': { redirect: '/components/content-renderer' },
    '/api/components/content-navigation': { redirect: '/components/content-navigation' },
    '/api/components/content-query': { redirect: '/components/content-query' },
    '/api/components/markdown': { redirect: '/components/content-slot' },
    '/api/components/content-slot': { redirect: '/components/content-slot' },
    '/api/components/prose': { redirect: '/components/prose' },
    '/api/composables/query-content': { redirect: '/composables/query-content' },
    '/api/composables/fetch-content-navigation': { redirect: '/composables/fetch-content-navigation' },
    '/api/composables/unwrap': { redirect: '/composables/use-unwrap' },
    '/api/composables/use-document-driven': { redirect: '/document-driven/use-content' },
    '/api/composables/use-content-helpers': { redirect: '/composables/use-content-helpers' },
    '/api/composables/use-content-head': { redirect: '/composables/use-content-head' },
    '/api/configuration': { redirect: '/get-started/configuration' },
    '/api/advanced': { redirect: '/recipes/hooks' },
    '/changelog': { redirect: 'https://github.com/nuxt/content/releases' },
    '/examples/**': { redirect: '/playground' },
    '/blog/announcing-v2': { redirect: '/' },
    '/v1': { redirect: '/v1/getting-started/introduction' },
    // Shortcuts
    '/document-driven': { redirect: '/document-driven/introduction' }
  },

  content: {
    highlight: {
      preload: ['xml'],
      theme: {
        default: 'solarized-light',
        dark: 'dark-plus'
      }
    }
  },
  nitro: {
    prerender: {
      routes: [
        '/api/search.json'
      ]
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxthq/studio',
    '@vueuse/nuxt',
    '@nuxtjs/fontaine',
    '@nuxtjs/google-fonts',
    'nuxt-og-image',
    '@nuxtjs/plausible'
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
