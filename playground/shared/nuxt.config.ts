import { fileURLToPath } from 'url'
import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'
import contentModule from '../../src/module' // eslint-disable-line

const themeDir = fileURLToPath(new URL('./', import.meta.url))
const resolveThemeDir = (path: string) => resolve(themeDir, path)

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
  components: [
    {
      global: true,
      path: resolveThemeDir('./components')
    }
  ],
  modules: [contentModule, '@nuxthq/admin'],
  content: {
    navigation: {
      fields: ['icon']
    },
    highlight: {
      theme: 'one-dark-pro',
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue']
    }
  }
})
