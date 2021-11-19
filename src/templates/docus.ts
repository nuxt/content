import { defineNuxtPlugin } from '#app'
import { createDocus } from '#docus'
// @ts-ignore
import docusConfig from '#docus/cache/docus.config.json'
// @ts-ignore
import themeConfig from '#docus/cache/theme.config.json'

export default defineNuxtPlugin(async (nuxt: any) => {
  const { $docus, init } = createDocus(nuxt, { docusConfig, themeConfig })

  nuxt.provide('docus', $docus)
  nuxt.provide('navigation', $docus.navigation)

  if (process.client) {
    window.$docus = $docus
  }

  await init()
})
