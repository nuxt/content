import { createCMS, type CMSClient } from '@comark/cms'
import { createCMSClient } from '@comark/cms/client'

export const cms = hybridCMSFactory()

function hybridCMSFactory(): CMSClient {
  let cms: CMSClient
  if (import.meta.server) {
    cms = createCMSClient({
      basePath: '/__nuxt_content',
      fetch: globalThis.$fetch,
    })
  }
  else {
    cms = createCMS({
      cache: {
        loadManifest: () => $fetch('/__nuxt_content/manifest.json'),
        loadSnapshot: source => $fetch(`/__nuxt_content/snapshot/${source}.json`),
      },
    }) as CMSClient
  }

  return cms!
}
