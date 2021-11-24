import { defineNuxtConfig } from '@nuxt/bridge'
import { resolveThemeDir } from './dirs'

export default defineNuxtConfig({
  components: [
    {
      path: resolveThemeDir('components'),
      isAsync: false,
      level: 2
    }
  ]
})
