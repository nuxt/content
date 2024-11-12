import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'
import pkg from '../package.json'

const { resolve } = createResolver(import.meta.url)

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
    url: 'https://content3.nuxt.dev',
  },

  content: {
    database: {
      type: 'd1',
      binding: 'DB',
      // type: 'libsql',
      // url: process.env.TURSO_DATABASE_URL!,
      // authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  },

  mdc: {
    highlight: {
      noApiRoute: false,
    },
    studio: {
      enabled: true,
      dev: true,
      gitInfo: {
        owner: 'larbish',
        name: 'starter-larb',
      },
    },
  },

  runtimeConfig: {
    public: {
      version: pkg.version,
    },
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
