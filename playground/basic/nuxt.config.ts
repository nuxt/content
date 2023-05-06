import { resolve } from 'pathe'

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

    experimental: {
      advancedIgnoresPattern: true
    },

    ignores: [
      '\\.bak$',
      'ignored/folder'
    ]
  },
  typescript: {
    includeWorkspace: true
  }
})
