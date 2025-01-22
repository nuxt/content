import type { Connector } from 'db0'
import type { Resolver } from '@nuxt/kit'
import type { CacheEntry, LocalDevelopmentDatabase } from '../types'

export function getDefaultSqliteAdapter() {
  return process.versions.bun ? 'bunsqlite' : 'sqlite'
}

export function resolveDatabaseAdapter(adapter: 'sqlite' | 'bunsqlite' | 'postgres' | 'libsql', resolver: Resolver) {
  const databaseConnectors = {
    sqlite: 'db0/connectors/better-sqlite3',
    bunsqlite: resolver.resolve('./runtime/internal/bunsqlite'),
    postgres: 'db0/connectors/postgresql',
    libsql: 'db0/connectors/libsql/web',
    d1: 'db0/connectors/cloudflare-d1',
  }

  adapter = adapter || 'sqlite'
  if (adapter === 'sqlite' && process.versions.bun) {
    return databaseConnectors.bunsqlite
  }

  return databaseConnectors[adapter]
}

async function getDatabase(filename: string): Promise<Connector> {
  const type = getDefaultSqliteAdapter()
  return import(type === 'bunsqlite' ? 'db0/connectors/bun-sqlite' : 'db0/connectors/better-sqlite3')
    .then((m) => {
      const connector = (m.default || m) as (config: unknown) => Connector
      return connector({ path: filename })
    })
}

const _localDatabase: Record<string, Connector> = {}
export async function getLocalDatabase(databaseLocation: string): Promise<LocalDevelopmentDatabase> {
  const db = _localDatabase[databaseLocation] || await getDatabase(databaseLocation)

  _localDatabase[databaseLocation] = db
  await db.exec('CREATE TABLE IF NOT EXISTS _development_cache (id TEXT PRIMARY KEY, checksum TEXT, parsedContent TEXT)')

  const fetchDevelopmentCache = async () => {
    const result = await db.prepare('SELECT * FROM _development_cache').all() as CacheEntry[]
    return result.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, CacheEntry>)
  }

  const fetchDevelopmentCacheForKey = async (key: string) => {
    return await db.prepare('SELECT * FROM _development_cache WHERE id = ?').get(key) as CacheEntry | undefined
  }

  const insertDevelopmentCache = async (id: string, checksum: string, parsedContent: string) => {
    deleteDevelopmentCache(id)
    db.exec(`INSERT INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
  }

  const deleteDevelopmentCache = async (id: string) => {
    db.exec(`DELETE FROM _development_cache WHERE id = '${id}'`)
  }

  const dropContentTables = async () => {
    const tables = await db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name LIKE ?').all('table', '_content_%') as { name: string }[]
    for (const { name } of tables) {
      db.exec(`DROP TABLE ${name}`)
    }
  }

  return {
    database: db,
    async exec(sql: string) {
      db.exec(sql)
    },
    close() {
      _localDatabase[databaseLocation] = undefined
    },
    fetchDevelopmentCache,
    fetchDevelopmentCacheForKey,
    insertDevelopmentCache,
    deleteDevelopmentCache,
    dropContentTables,
  }
}
