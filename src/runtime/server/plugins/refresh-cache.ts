import { defineNitroPlugin } from 'nitropack/runtime'
import type { WatchEvent } from 'unstorage';
// @ts-expect-error
import { useStorage } from '#imports'

export default defineNitroPlugin(async (nitro) => {
  const { cleanCachedContents } = await import('../storage')
  const storage = useStorage()

  const unwatch = await storage.watch(async (event: WatchEvent, key: string) => {
    if (key.startsWith('content:source')) {
      cleanCachedContents();
    }
  });
  nitro.hooks.hook('close', async () => {
    typeof unwatch  === 'function' && await unwatch()
  })
})
