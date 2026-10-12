import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],
  content: {
    database: { type: 'd1', bindingName: 'DB' },
  },
  compatibilityDate: '2025-09-03',
  nitro: {
    preset: 'cloudflare-module',
  },
})
