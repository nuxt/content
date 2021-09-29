import { resolve } from 'pathe'
import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  components: [
    {
      path: resolve(__dirname, 'components'),
      prefix: '',
      isAsync: false,
      level: 2
    }
  ],
  buildModules: ['@nuxtjs/composition-api/module'],
  modules: ['../src'],
  bridge: {
    capi: false
  }
})
