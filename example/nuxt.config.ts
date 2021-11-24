import { resolve } from 'pathe'
import { defineNuxtConfig } from '@nuxt/bridge'

const config = defineNuxtConfig({
  rootDir: resolve(__dirname),
  modules: ['../src']
})

export default config
