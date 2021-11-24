import { defineNuxtConfig } from '@nuxt/bridge'
import { resolve } from 'pathe'

export default defineNuxtConfig({
  components: [
    {
      path: resolve(__dirname, '/components'),
      isAsync: false,
      level: 2
    }
  ]
})
