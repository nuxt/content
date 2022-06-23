import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui'
  ],
  content: {
    documentDriven: true
  }
})
