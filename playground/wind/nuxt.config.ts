import { defineNuxtConfig } from 'nuxt'
import contentModule from '../../src/module' // eslint-disable-line

export default defineNuxtConfig({
  modules: [contentModule],
  content: {
    documentDriven: {
    }
  }
})
