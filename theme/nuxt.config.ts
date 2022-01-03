import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: ['@unocss/nuxt'],
  // Docs: https://github.com/antfu/unocss
  // @ts-ignore
  unocss: {
    uno: true,
    icons: true,
    preflight: true,
    shortcuts: [],
    rules: []
  }
})
