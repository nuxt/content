import { defineNuxtConfig } from 'nuxt'
import consola from 'consola'
import colors from 'tailwindcss/colors.js'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxt/content!')
  alias['@nuxt/content'] = '../src/module.ts'
}

export default defineNuxtConfig({
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
      'process.env': {}
    },
    build: {
      rollupOptions: {
        external: ['monaco-editor']
      }
    }
  },
  nitro: {
    externals: {
      external: ['monaco-editor']
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
