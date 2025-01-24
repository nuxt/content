import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { DEVTOOLS_UI_PATH } from '../../constants'

export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  ssr: false,
  app: {
    baseURL: DEVTOOLS_UI_PATH,
  },

  compatibilityDate: '2024-12-01',
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },

  unocss: {
    shortcuts: {
      'bg-base': 'bg-white dark:bg-[#151515]',
      'bg-active': 'bg-gray:5',
      'bg-hover': 'bg-gray:3',
      'border-base': 'border-gray/20',
      'glass-effect': 'backdrop-blur-6 bg-white/80 dark:bg-[#151515]/90',
      'navbar-glass': 'sticky z-10 top-0 glass-effect',
    },
  },
})
