// @ts-nocheck
import { defineNuxtPlugin } from '#app'
import { createDocus } from '#docus'
import docusConfig from '#docus-cache/docus.config.json'
import themeConfig from '#docus-cache/theme.config.json'

export default defineNuxtPlugin(async nuxt => {
  const { $docus, init } = createDocus(nuxt, { docusConfig, themeConfig })

  nuxt.provide('docus', $docus)
  nuxt.provide('navigation', $docus.navigation)

  if (process.client) {
    window.$docus = $docus
    window.$navigation = $docus.navigation
  }

  await init()
})
