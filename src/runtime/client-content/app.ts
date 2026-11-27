import { comarkContent, contentHub } from 'comark-content/runtime'
import type { ContentClient } from 'comark-content/client'
import { createContentClient } from 'comark-content/client'
import snapshot from 'comark-content/sources/snapshot'
import type { ContentPlugin } from 'comark-content'
// Imported explicitly: Nuxt doesn't auto-import into `node_modules`.
import { $fetch } from '#imports'

export interface NuxtAppContentOptions {
  /** Plugins of the browser instance, created from the prerendered snapshot. Every instance of a hub gets them. */
  plugins?: ContentPlugin<any>[]
}

/**
 * Create the `content` the app reads, in `app/content.ts`. The browser counterpart of
 * `createNuxtContent()` from `@nuxt/content/server`, for `compatibilityVersion: 4` in hybrid mode.
 */
export function createNuxtContent(options: NuxtAppContentOptions = {}): ContentClient {
  if (import.meta.server) {
    return createContentClient({ basePath: '/__nuxt_content', fetch: $fetch })
  }

  const names = import.meta.content.sources
  // Each instance loads its snapshot on the first read.
  const create = (name: string, manifest?: string) => comarkContent(name, {
    source: snapshot(`/__nuxt_content/snapshot/${name}.json`, manifest),
    plugins: options.plugins,
  })
  if (names.length === 1) {
    return create(names[0]!, '/__nuxt_content/manifest.json') as unknown as ContentClient
  }
  return contentHub(names.map(name => create(name)), { basePath: '/__nuxt_content' }) as unknown as ContentClient
}
