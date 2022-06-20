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
  generate: {
    routes: []
  },
  modules: ['@nuxthq/admin', '@docus/github', 'vue-plausible'],
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
  plausible: {
    domain: 'content.nuxtjs.org'
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
  colorMode: {
    preference: 'dark'
  },
  theme: {}
})
