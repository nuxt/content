// @ts-nocheck
import { defineNuxtPlugin } from '#app'
import { createDocus } from '#docus'

export default defineNuxtPlugin(async (ctx, inject) => {
  let docusConfig = {}
  let themeConfig = {}

  <% if (options.hasDocusConfig) { %>
  docusConfig = (await import('#docus-cache/docus.config.json')).default
  <% } %>

  <% if (options.hasThemeConfig) { %>
  themeConfig = (await import('#docus-cache/theme.config.json')).default
  <% } %>

  await createDocus(ctx, { docusConfig, themeConfig }, inject)
})
