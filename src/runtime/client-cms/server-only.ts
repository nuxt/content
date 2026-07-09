import { createCMSClient } from '@comark/cms/client'
import { v3ClientPlugins } from '../v3/cms-plugins.client'

export const cms = createCMSClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: v3ClientPlugins(),
})
