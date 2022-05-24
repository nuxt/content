import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt'
import consola from 'consola'
import colors from 'tailwindcss/colors.js'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxt/content!')
  alias['@nuxt/content'] = '../src/module.ts'
}

export default defineNuxtConfig({
  content: {
    sources: [
      {
        name: 'v1-en',
        prefix: '/v1/en',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/en')
      },
      {
        name: 'v1-ru',
        prefix: '/v1/ru',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ru')
      },
      {
        name: 'v1-ja',
        prefix: '/v1/ja',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/ja')
      },
      {
        name: 'v1-fr',
        prefix: '/v1/fr',
        driver: 'fs',
        base: resolve(__dirname, 'content-v1/fr')
      }
    ],
    highlight: {
      preload: ['xml']
    }
  },
  generate: {
    routes: []
  },
  modules: ['@nuxthq/admin', '@docus/github'],
  alias,
  extends: [
    (process.env.DOCUS_THEME_PATH || './node_modules/@docus/docs-theme')
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
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: colors.emerald
          }
        }
      }
    }
  },
  theme: {}
})
