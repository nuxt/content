import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  alias: {
    '@nuxt/content': '../src/module.ts'
  },
  extends: ['./node_modules/docus/theme']
})
