import { defineNuxtConfig } from 'nuxt'
import consola from 'consola'
import colors from 'tailwindcss/colors.js'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxt/content!')
  alias['@nuxt/content'] = '../src/module.ts'
}

export default defineNuxtConfig({
  alias,
  components: [{
    path: '~/components',
    global: true
  }],
  extends: ['./node_modules/docus/theme'],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: colors.emerald
          }
        }
      }
    }
  }
})
