import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt'
import consola from 'consola'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxt/content!')
  alias['@nuxt/content'] = '../src/module.ts'
}

export default defineNuxtConfig({
  alias,
  app: {
    head: {
      script: [
        {
          defer: true,
          'data-domain': 'content.nuxtjs.org',
          src: 'https://plausible.io/js/script.js'
        }
      ]
    }
  },
  content: {
    sources: [
      {
        name: 'v1',
        prefix: '/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/en')
      },
      {
        name: 'v1-ja',
        prefix: '/ja/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ja')
      },
      {
        name: 'v1-fr',
        prefix: '/fr/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/fr')
      },
      {
        name: 'v1-ru',
        prefix: '/ru/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ru')
      },
      {
        name: 'v1-pt',
        prefix: '/pt/v1',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/pt')
      }
    ],
    highlight: {
      preload: ['xml']
    }
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/blog/announcing-v2'
      ]
    }
  },
  modules: ['@nuxtlabs/github-module'],
  extends: [
    (process.env.DOCUS_THEME_PATH || '@nuxt-themes/docus')
  ],
  github: {
    owner: 'nuxt',
    repo: 'content',
    branch: 'main'
  },
  vite: {
    define: {
      'process.env.FORCE_COLOR': {},
      'process.env.NODE_DISABLE_COLORS': {},
      'process.env.NO_COLOR': {},
      'process.env.FORCE_TERM': {}
    }
  },
  colorMode: {
    preference: 'dark'
  },
  theme: {}
})
