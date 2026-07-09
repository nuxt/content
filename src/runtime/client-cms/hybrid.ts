import { createCMS, type CMSClient } from '@comark/cms'
import { createCMSClient } from '@comark/cms/client'

async function hybridCMSFactory(): Promise<CMSClient> {
  if (import.meta.server) {
    const { v3ClientPlugins } = await import('../v3/cms-plugins.client')
    return createCMSClient({
      basePath: '/__nuxt_content',
      fetch: globalThis.$fetch,
      plugins: v3ClientPlugins(),
    })
  }

  const { v3WasmPlugins } = await import('../v3/cms-plugins.wasm')
  return createCMS({
    cache: {
      loadManifest: () => $fetch('/__nuxt_content/manifest.json'),
      loadSnapshot: source => $fetch(`/__nuxt_content/snapshot/${source}.json`),
    },
    plugins: v3WasmPlugins(),
  }) as CMSClient
}

export const cms = await hybridCMSFactory()
