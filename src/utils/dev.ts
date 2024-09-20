import crypto from 'node:crypto'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import Database from 'better-sqlite3'
import type { Nuxt } from '@nuxt/schema'
import { useLogger } from '@nuxt/kit'
import { type ConsolaInstance } from 'consola'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import type { ResolvedCollection } from '../types/collection'
import { generateCollectionInsert, parseSourceBase } from './collection'
import { parseContent } from './content'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export async function watchContents(nuxt: Nuxt, collections: ResolvedCollection[], databaseLocation: string) {
  const db = localDatabase(databaseLocation)

  const watcher = chokidar.watch('.', {
    ignoreInitial: true,
    cwd: join(nuxt.options.rootDir, 'content'),
  })

  watcher.on('add', onChange)
  watcher.on('change', onChange)
  watcher.on('unlink', onChange)

  async function onChange(path: string) {
    const collection = collections.find(({ source }) => source?.base && micromatch.isMatch(path, source?.base, { ignore: source?.ignore || [] }))
    if (collection) {
      logger.info(`File changed. collection: ${collection.name}, path: ${path}`)

      const { fixed } = parseSourceBase(collection.source!)
      const keyInCollection = join(collection.name, collection.source?.prefix || '', path.replace(fixed, ''))

      const content = await readFile(join(nuxt.options.rootDir, 'content', path), 'utf8')
      const checksum = getContentChecksum(content)
      const localCache = db.fetchDevelopmentCacheForKey(keyInCollection)

      if (localCache && localCache.checksum === checksum) {
        db.exec(generateCollectionInsert(collection, JSON.parse(localCache.parsedContent)))
        return
      }

      const parsedContent = await parseContent(keyInCollection, content, collection)
      await db.exec(generateCollectionInsert(collection, parsedContent))
      db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))
    }
  }

  nuxt.hook('close', async () => {
    watcher.close()
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
    exec: (sql: string) => {
      _localDatabase!.exec(sql)
    },
    close: () => {
      _localDatabase!.close()
      _localDatabase = undefined
    },
  }
}

export function* chunks<T>(arr: T[], size: number): Generator<T[], void, unknown> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
