// @ts-nocheck
import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import { createDocus } from '#docus'

export default defineNuxtPlugin(async (ctx) => {
  let docusConfig = {}
  let themeConfig = {}

  <% if (options.hasDocusConfig) { %>
  docusConfig = (await import('#docus-cache/docus.config.json')).default
  <% } %>

  <% if (options.hasThemeConfig) { %>
  themeConfig = (await import('#docus-cache/theme.config.json')).default
  <% } %>

  await createDocus(ctx, { docusConfig, themeConfig })
})
