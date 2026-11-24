import { comarkContent, contentHub } from 'comark-content/runtime'
import type { ContentClient } from 'comark-content/client'
import { createContentClient } from 'comark-content/client'
import snapshot from 'comark-content/sources/snapshot'
import type { CacheArtifact, Manifest } from 'comark-content'
import { readArtifact } from 'comark-content'
// Imported explicitly: Nuxt doesn't auto-import into `node_modules`, and a bare `$fetch`
// global isn't defined yet when this module's top-level `await` runs.
import { $fetch } from '#imports'
import { v3WasmPlugins } from '#content-wasm-plugins'

async function hybridContentFactory(): Promise<ContentClient> {
  const v3 = import.meta.content.compatibilityVersion === 3
  if (import.meta.server) {
    const plugins = v3 ? (await import('../v3/content-plugins.client')).v3ClientPlugins() : []
    return createContentClient({
      basePath: '/__nuxt_content',
      fetch: $fetch,
      plugins,
    })
  }

  // Browser hybrid mode: hydrate from the prerendered snapshot + WASM sqlite plugins.
  // One shared plugin set (one WASM database) so multi-instance FTS ranks correctly.
  // `#content-wasm-plugins` returns no plugins outside v3, so sqlite isn't bundled there.
  const sharedPlugins = v3WasmPlugins()

  const artifact = await $fetch<CacheArtifact | Manifest>('/__nuxt_content/manifest.json')
  const manifest = isCacheArtifact(artifact)
    ? await readArtifact<Manifest>(artifact)
    : artifact as Manifest
  const names = manifest.sources?.length ? manifest.sources : ['default']

  if (names.length === 1) {
    const name = names[0]!
    return comarkContent(name, {
      source: snapshot(
        `/__nuxt_content/snapshot/${name}.json`,
        '/__nuxt_content/manifest.json',
      ),
      plugins: sharedPlugins,
    }) as unknown as ContentClient
  }

  const instances = names.map(name => comarkContent(name, {
    source: snapshot(
      `/__nuxt_content/snapshot/${name}.json`,
      // Per-instance manifest isn't always available; the hub merges on demand.
      undefined,
    ),
    plugins: sharedPlugins,
  }))

  return contentHub(instances, { basePath: '/__nuxt_content' }) as unknown as ContentClient
}

function isCacheArtifact(value: unknown): value is CacheArtifact {
  return !!value && typeof value === 'object' && 'checksum' in value && 'data' in value
}

export const content = await hybridContentFactory()
