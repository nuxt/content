import { defineNitroPlugin } from 'nitropack/runtime'
import { cleanCachedContents } from "../storage";
import type { WatchEvent } from 'unstorage';
// @ts-expect-error
import { useStorage } from '#imports'

export default defineNitroPlugin(async (nitro) => {
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
