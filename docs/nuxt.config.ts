import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: process.env.NUXT_ELEMENTS_PATH || '@nuxthq/elements',

  content: {
    sources: {
      v1: {
        prefix: '/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/en')
      },
      'v1-ja': {
        prefix: '/ja/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ja')
      },
      'v1-fr': {
        prefix: '/fr/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/fr')
      },
      'v1-ru': {
        prefix: '/ru/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ru')
      }
    },
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
    content: {
      // @ts-ignore
      // TODO: fix types
      documentDriven: {
        host: 'https://content.nuxtjs.org'
      }
    },
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
    // Downside: bigger JS bundle
    // With sync: 465KB, gzip: 204KB
    // Without: 418KB, gzip: 184KB
    'components:extend': function (components) {
      for (const comp of components) {
        if (comp.global) { comp.global = 'sync' }
      }
    }
  }
})
