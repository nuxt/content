import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  alias: {
    '@nuxt/content': '../src/module.ts'
  },
  components: [{
    path: '~/components',
    global: true
  }],
  extends: ['./node_modules/docus/theme']
})
