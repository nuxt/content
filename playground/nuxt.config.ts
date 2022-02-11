import { defineNuxtConfig } from 'nuxt3'
import contentModule from '..' // eslint-disable-line

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: [contentModule],
  components: true
  // content: {}
})
