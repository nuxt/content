import { defineNuxtConfig } from 'nuxt'
import { resolve } from 'pathe'
import contentModule from '../../..'

export default defineNuxtConfig({
  nitro: {
    plugins: [
      '~/addons/nitro-plugin.ts'
    ]
  },
  components: {
    dirs: [
      {
        path: resolve(__dirname, './components'),
        global: true
      }
    ]
  },
  buildModules: [contentModule],
  content: {
    locales: ['en', 'fa'],
    sources: [
      {
        name: 'fa-ir',
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa')
      },
      {
        name: '_tests',
        prefix: '/_tests',
        driver: 'fs',
        base: resolve(__dirname, 'content-tests')
      }
    ],
    navigation: {
      fields: ['icon']
    }
  }
})
