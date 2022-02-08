import { defineNuxtConfig } from 'nuxt3'
import contentModule from '..'

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: [contentModule]
  // content: {}
})
