import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'
import contentModule from '../src/module' // eslint-disable-line

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/@picocss/pico@latest/css/pico.min.css'
        }
      ]
    }
  },
  rootDir: __dirname,
  modules: [contentModule, '@nuxthq/admin'],
  content: {
    navigation: {
      fields: ['icon']
    },
    sources: {
      'translation-fa': {
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      }
    },
    highlight: {
      theme: 'one-dark-pro',
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue']
    }
  }
})
