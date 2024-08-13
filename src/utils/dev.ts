import type { createStorage, WatchEvent } from 'unstorage'
import Database from 'better-sqlite3'
import type { Nuxt } from '@nuxt/schema'
import type { ResolvedCollection } from '../types/collection'
import { generateCollectionInsert } from './collection'
import { parseContent } from './content'

export async function watchContents(nuxt: Nuxt, storage: ReturnType<typeof createStorage>, collections: ResolvedCollection[], databaseLocation: string) {
  const db = Database(databaseLocation)
  // Watch contents
  await storage.watch(async (event: WatchEvent, key: string) => {
    console.log('Content changed', key)

    const collection = collections.find(c => key.startsWith(c.name))
    if (collection) {
      const parsedContent = await parseContent(storage, collection, key)
      await db.exec(`DELETE FROM ${collection.name} WHERE id = '${key}'`)
      if (event === 'update') {
        await db.exec(generateCollectionInsert(collection, parsedContent))
      }
    }
  })

  nuxt.hook('close', async () => {
    await storage.unwatch()
    await storage.dispose()
  })
}
