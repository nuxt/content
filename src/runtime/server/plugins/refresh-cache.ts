import { defineNitroPlugin } from 'nitropack/runtime'
import { cleanCachedContents } from "../storage";
import type { WatchEvent } from 'unstorage';
// @ts-expect-error
import { useStorage } from '#imports'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  storage.watch(async (event: WatchEvent, key: string) => {
    if (key.startsWith('content:source')) {
      cleanCachedContents();
    }
  });
})
