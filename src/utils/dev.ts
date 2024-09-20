import crypto from 'node:crypto'
import type { createStorage, WatchEvent } from 'unstorage'
import Database from 'better-sqlite3'
import type { Nuxt } from '@nuxt/schema'
import { useLogger } from '@nuxt/kit'
import type { ResolvedCollection } from '../types/collection'
import { generateCollectionInsert } from './collection'
import { parseContent } from './content'

export const logger = useLogger('@nuxt/content')

export async function watchContents(nuxt: Nuxt, storage: ReturnType<typeof createStorage>, collections: ResolvedCollection[], databaseLocation: string) {
  const db = localDatabase(databaseLocation)
  // Watch contents
  await storage.watch(async (event: WatchEvent, key: string) => {
    logger.info('Content changed', key)

    const collection = collections.find(c => key.startsWith(c.name))
    if (collection) {
      await db.exec(`DELETE FROM ${collection.name} WHERE id = '${key}'`)
      if (event === 'update') {
        const content = await storage.getItem(key) as string
        const checksum = getContentChecksum(content)
        const localCache = db.fetchDevelopmentCacheForKey(key)

        if (localCache && localCache.checksum === checksum) {
          db.exec(generateCollectionInsert(collection, JSON.parse(localCache.parsedContent)))
          return
        }

        const parsedContent = await parseContent(key, content, collection)
        await db.exec(generateCollectionInsert(collection, parsedContent))
        db.insertDevelopmentCache(key, checksum, JSON.stringify(parsedContent))
      }
    }
  })

  nuxt.hook('close', async () => {
    await storage.unwatch()
    await storage.dispose()
    db.close()
  })
}

export function getContentChecksum(content: string) {
  return crypto
    .createHash('md5')
    .update(content, 'utf8')
    .digest('hex')
}

let _localDatabase: Database.Database | undefined
export function localDatabase(databaseLocation: string) {
  if (!_localDatabase) {
    _localDatabase = Database(databaseLocation)
    _localDatabase!.exec('CREATE TABLE IF NOT EXISTS _development_cache (id TEXT PRIMARY KEY, checksum TEXT, parsedContent TEXT)')
  }

  return {
    fetchDevelopmentCache() {
      return _localDatabase!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache')
        .all()
        .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, { checksum: string, parsedContent: string }>)
    },
    fetchDevelopmentCacheForKey(key: string) {
      return _localDatabase!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache WHERE id = ?')
        .get(key)
    },
    insertDevelopmentCache(id: string, checksum: string, parsedContent: string) {
      _localDatabase!.exec(`INSERT OR REPLACE INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
    },
    exec: (sql: string) => _localDatabase!.exec(sql),
    close: () => {
      _localDatabase!.close()
      _localDatabase = undefined
    },
  }
}
