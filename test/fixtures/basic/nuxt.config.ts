import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt3'

const modulePath = resolve(__dirname, '../../../src/index')

export default defineNuxtConfig({
  buildDir: process.env.NITRO_BUILD_DIR,
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR }
  },
  buildModules: [modulePath]
})
