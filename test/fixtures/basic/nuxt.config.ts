import { defineNuxtConfig } from 'nuxt3'
import { resolve } from 'pathe'
import contentModule from '../../..'

export default defineNuxtConfig({
  buildDir: process.env.NITRO_BUILD_DIR,
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR },
    externals: {
      inline: [
        resolve('../../..'),
        'micromark-util-character',
        'micromark-factory-space',
        'micromark-factory-whitespace',
        'micromark-core-commonmark'
      ]
    }
  },
  buildModules: [contentModule],
  content: {
    sources: [
      {
        name: 'fa-ir',
        prefix: '/fa',
        driver: 'fs',
        driverOptions: {
          base: resolve(__dirname, 'content-fa')
        }
      }
    ]
  }
})
