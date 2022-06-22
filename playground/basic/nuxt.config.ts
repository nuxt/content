import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['../shared'],
  content: {
    sources: [
      {
        name: 'translation-fa',
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      }
    ]
  }
})
