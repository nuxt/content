import { createContentClient } from 'comark-content/client'

export const content = createContentClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: import.meta.content.compatibilityVersion === 3 ? (await import('../v3/content-plugins.client')).v3ClientPlugins() : [],
})
