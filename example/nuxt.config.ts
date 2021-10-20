import { resolve } from 'pathe'
import { defineNuxtConfig } from '@nuxt/bridge'

const config = defineNuxtConfig({
  components: [
    {
      path: resolve(__dirname, 'components'),
      prefix: '',
      isAsync: false,
      level: 2
    }
  ],
  modules: ['../src'],
  build: {
    transpile: ['@nuxt/bridge']
  },
  nitro: {
    externals: {
      inline: ['@docus/mdc']
    },
    experiments: {
      wasm: true
    }
  }
})

export default config
