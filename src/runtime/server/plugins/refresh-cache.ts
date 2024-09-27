import type { WatchEvent } from 'unstorage';
// @ts-expect-error
import { useStorage, defineNitroPlugin } from '#imports'

export default defineNitroPlugin(async (nitro) => {
  const { cleanCachedContents } = await import('../storage')
  const storage = useStorage()

  const unwatch = await storage.watch(async (event: WatchEvent, key: string) => {
    if (key.startsWith('content:source')) {
      cleanCachedContents();
    }
  });
  nitro.hooks.hook('close', async () => {
    if (typeof unwatch  === 'function') {
      await unwatch()
    }
  })
})
