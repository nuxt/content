import { resolve } from 'pathe'
import { defineNuxtConfig } from 'nuxt3'
import { resolveModule } from '@nuxt/kit'

const modulePath = resolve(__dirname, '../src/index')

export default defineNuxtConfig({
  rootDir: __dirname,
  buildModules: [modulePath],
  docus: {
    query: {
      plugins: [resolveModule('./extras/version', { paths: __dirname })]
    }
  }
})
