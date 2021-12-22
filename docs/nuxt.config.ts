import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt3'

const modulePath = resolve(__dirname, '../src/index')

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: [modulePath]
})
