import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['../shared'],
  content: {
    components: ['hello-world'],
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
    ]
  },
  typescript: {
    includeWorkspace: true
  }
})
