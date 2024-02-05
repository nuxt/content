import { resolve } from 'pathe'
import contentModule from '../../src/module'

export default defineNuxtConfig({
  extends: ['../shared'],
  content: {
    sources: {
      'translation-fa': {
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      }
    },

    ignores: [
      '\\.bak$',
      'ignored/folder'
    ],

    highlight: {
      langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml']
    }
  },
  typescript: {
    includeWorkspace: true
  },
  modules: [
    // @ts-ignore
    contentModule
    // '@nuxtjs/tailwindcss'
  ]
})
