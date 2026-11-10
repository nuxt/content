import { createContentClient } from 'comark-content/client'

export const content = createContentClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: import.meta.content.v3Compatibility ? (await import('../v3/content-plugins.client')).v3ClientPlugins() : [],
})
