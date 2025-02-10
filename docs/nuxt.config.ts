import { readFileSync } from 'node:fs'
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'pathe'
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
        highlight: {
          langs: ['docker'],
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
    ...(readFileSync(resolve(__dirname, '_redirects'), 'utf-8'))
      .split('\n')
      .filter(line => line.trim().length && !line.trim().startsWith('#'))
      .reduce((acc, line) => {
        const [from, to] = line.split('=') as [string, string]
        return Object.assign(acc, { [from]: { redirect: to } })
      }, {} as Record<string, { redirect: string }>),
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
