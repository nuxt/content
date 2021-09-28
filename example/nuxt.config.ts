import { resolve } from 'pathe'
import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  target: 'static',
  components: [
    {
      path: resolve(__dirname, 'components'),
      prefix: '',
      isAsync: false,
      level: 2
    }
  ],
  buildModules: ['@nuxtjs/composition-api/module', '@nuxt/typescript-build'],
  modules: ['../src'],
  content: {},
  nitro: {
    preset: 'browser'
  },
  bridge: {
    capi: false
  }
})
