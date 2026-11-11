import type { ContentClient } from 'comark-content/client'
import { createContentClient } from 'comark-content/client'

// Annotated so the published declaration keeps the `ContentClient` type, as in `hybrid.ts`:
// inferred, it is emitted as `any` and `content.get()` loses the generated content types.
export const content: ContentClient = createContentClient({
  basePath: '/__nuxt_content',
  fetch: globalThis.$fetch,
  plugins: import.meta.content.compatibilityVersion === 3 ? (await import('../v3/content-plugins.client')).v3ClientPlugins() : [],
})
