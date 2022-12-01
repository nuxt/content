import { fileURLToPath } from 'url'
import { resolve } from 'pathe'
import contentModule from '../../src/module'

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
    },
    {
      global: true,
      path: resolveThemeDir('./components/content')
    }
  ],
  modules: [contentModule],
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
