import { createContentClient } from 'comark-content/client'
import { v3ClientPlugins } from '../v3/cms-plugins.client'

export const cms = createContentClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: v3ClientPlugins(),
})
