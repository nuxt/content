import { createCMS, type CacheArtifact, type CMSOptions } from '@comark/cms'

interface NuxtContentCMSOptions extends CMSOptions {
  mode: 'server-only' | 'hybrid'
}

export function createNuxtContentCMS(options: NuxtContentCMSOptions) {
  if (options.mode === 'server-only') {
    return createCMS({
      basePath: '/__nuxt_content',
      cache: {
        async loadManifest() {
          // @ts-expect-error - missing import
          return await useStorage('assets:cms').get<CacheArtifact>('manifest.json') // server-only
        },
        loadSnapshot(source) {
          // @ts-expect-error - missing import
          return useStorage('assets:cms').get<CacheArtifact>(`${source}.json`) // server-only
        },
      },
      ...options,
    })
  }

  // hybrid
  return createCMS({
    basePath: '/__nuxt_content',
    cache: {
      async loadManifest() {
        return $fetch<CacheArtifact>('/__nuxt_content/manifest.json') // hybrid
      },
      loadSnapshot(source) {
        return $fetch<CacheArtifact>(`/__nuxt_content/snapshot/${source}.json`) // hybrid
      },
    },
    ...options,
  })
}
