import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt3'

const modulePath = resolve(__dirname, '../src/module')

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: [modulePath]
})
