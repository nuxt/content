import { defineNuxtConfig } from 'nuxt/config'
import pkg from '../package.json'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxthub/core',
    '@nuxtjs/plausible',
    '@vueuse/nuxt',
    'nuxt-og-image',
  ],

  app: {
    rootAttrs: {
      'vaul-drawer-wrapper': '',
      'class': 'bg-[--ui-bg]',
    },
  },

  site: {
    url: 'https://content.nuxt.com',
  },

  content: {
    build: {
      markdown: {
        toc: {
          depth: 4,
          searchDepth: 4,
        },
      },
    },
    database: {
      type: 'd1',
      bindingName: 'DB',
      // type: 'libsql',
      // url: process.env.TURSO_DATABASE_URL!,
      // authToken: process.env.TURSO_AUTH_TOKEN!,
    },
    preview: {
      dev: true,
      api: 'https://api.nuxt.studio',
    },
  },

  mdc: {
    highlight: {
      noApiRoute: false,
    },
  },
  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },
  routeRules: {
    // Content v2 redirects
    '/get-started': { redirect: '/get-started/installation' },
    '/guide/writing/content-directory': { redirect: 'https://v2.content.nuxt.com/usage/content-directory' },
    '/guide/writing/markdown': { redirect: '/docs/files/markdown' },
    '/guide/writing/mdc': { redirect: '/docs/files/markdown' },
    '/guide/writing/json': { redirect: '/docs/files/json' },
    '/guide/writing/yaml': { redirect: '/docs/files/yaml' },
    '/guide/writing/csv': { redirect: 'https://v2.content.nuxt.com/writing/files' },
    '/guide/writing/document-driven': { redirect: 'https://v2.content.nuxt.com/document-driven/introduction' },
    '/guide/writing/vue-components': { redirect: '/docs/files/markdown#vue-components' },
    '/guide/displaying/rendering': { redirect: '/docs/components/content-renderer' },
    '/guide/displaying/querying': { redirect: '/docs/utils/query-collection' },
    '/guide/displaying/navigation': { redirect: '/docs/utils/query-collection-navigation' },
    '/guide/displaying/typescript': { redirect: 'https://v2.content.nuxt.com/usage/typescript' },
    '/guide/recipes/sitemap': { redirect: 'https://v2.content.nuxt.com/recipes/sitemap' },
    '/guide/deploy/node-server': { redirect: '/docs/getting-started/installation' },
    '/guide/deploy/static-hosting': { redirect: '/docs/getting-started/installation' },
    '/guide/migration/from-v1': { redirect: 'https://v2.content.nuxt.com/get-started/from-v1' },
    '/content-v1': { redirect: 'https://v2.content.nuxt.com/get-started/from-v1' },
    // TODO: content v3
    '/guide/migration/edge-channel': { redirect: 'https://v2.content.nuxt.com/get-started/edge-channel' },
    '/api/components/content-doc': { redirect: 'https://v2.content.nuxt.com/components/content-doc' },
    '/api/components/content-list': { redirect: 'https://v2.content.nuxt.com/components/content-list' },
    '/api/components/content-renderer': { redirect: 'https://v2.content.nuxt.com/components/content-renderer' },
    '/api/components/content-navigation': { redirect: 'https://v2.content.nuxt.com/components/content-navigation' },
    '/api/components/content-query': { redirect: 'https://v2.content.nuxt.com/components/content-query' },
    '/api/components/markdown': { redirect: 'https://v2.content.nuxt.com/components/content-slot' },
    '/api/components/content-slot': { redirect: 'https://v2.content.nuxt.com/components/content-slot' },
    '/api/components/prose': { redirect: '/docs/components/prose' },
    '/api/composables/query-content': { redirect: 'https://v2.content.nuxt.com/composables/query-content' },
    '/api/composables/fetch-content-navigation': { redirect: 'https://v2.content.nuxt.com/composables/fetch-content-navigation' },
    '/api/composables/unwrap': { redirect: 'https://v2.content.nuxt.com/composables/use-unwrap' },
    '/api/composables/use-document-driven': { redirect: 'https://v2.content.nuxt.com/document-driven/use-content' },
    '/api/composables/use-content-helpers': { redirect: 'https://v2.content.nuxt.com/composables/use-content-helpers' },
    '/api/composables/use-content-head': { redirect: 'https://v2.content.nuxt.com/composables/use-content-head' },
    '/api/configuration': { redirect: '/docs/getting-started/configuration' },
    '/api/advanced': { redirect: '/docs/advanced/hooks' },
    '/changelog': { redirect: 'https://github.com/nuxt/content/releases' },
    '/examples/**': { redirect: 'https://v2.content.nuxt.com/playground' },
    '/blog/announcing-v2': { redirect: 'https://v2.content.nuxt.com/' },
    '/v1': { redirect: 'https://v2.content.nuxt.com/v1/getting-started/introduction' },
    '/document-driven': { redirect: 'https://v2.content.nuxt.com/document-driven/introduction' },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-07-09',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: [
            '/docs/*',
          ],
        },
      },
    },
  },

  hub: {
    database: true,
    cache: true,
  },

  icon: {
    clientBundle: {
      scan: true,
    },
    serverBundle: 'local',
  },

  image: {
    provider: 'ipx',
  },

  ogImage: {
    zeroRuntime: true,
  },
})
