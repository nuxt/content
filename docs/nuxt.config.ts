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
      }
    ],
    highlight: {
      preload: ['xml']
    }
  },
  generate: {
    routes: []
  },
  modules: ['@nuxthq/admin'],
  alias,
  extends: [
    (process.env.DOCUS_THEME_PATH || './node_modules/@docus/docs-theme')
  ],
  github: {
    repo: 'nuxt/content'
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
