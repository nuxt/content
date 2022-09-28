import { defineNuxtConfig } from 'nuxt/config'
import previewModule from './src/module'

export default defineNuxtConfig({
  extends: ['../shared'],
  modules: [previewModule],
  content: {}
})
