import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'
import contentModule from '../src/module' // eslint-disable-line

export default defineNuxtConfig({
  rootDir: __dirname,
  modules: [contentModule],
  content: {
    navigation: {
      fields: ['icon']
    },
    sources: [
      {
        name: 'translation-fa',
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      }
    ],
    highlight: {
      theme: 'one-dark-pro',
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue']
    }
  }
})
