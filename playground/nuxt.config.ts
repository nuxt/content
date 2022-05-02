import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'
import contentModule from '../src/module' // eslint-disable-line

export default defineNuxtConfig({
  rootDir: __dirname,
  modules: [contentModule],
  components: {
    dirs: [
      {
        path: resolve(__dirname, './components'),
        global: true
      }
    ]
  },
  content: {
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
