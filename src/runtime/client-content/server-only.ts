import { createContentClient } from 'comark-content/client'
import { v3ClientPlugins } from '../v3/content-plugins.client'

export const content = createContentClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: v3ClientPlugins(),
})
