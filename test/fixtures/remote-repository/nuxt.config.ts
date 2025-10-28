import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '../../../src/module',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-09-03',
})
