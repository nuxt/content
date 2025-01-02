import { getBunSqliteDatabaseAdapter } from '../runtime/internal/bunsqlite'
import { getBetter3DatabaseAdapter } from '../runtime/internal/sqlite'
import type { DatabaseAdapter, LocalDevelopmentDatabase } from '../types'

export function getDefaultSqliteAdapter() {
  return process.versions.bun ? 'bunsqlite' : 'sqlite'
}

async function getDatabase(filename: string): Promise<DatabaseAdapter> {
  const type = getDefaultSqliteAdapter()
  if (type === 'bunsqlite') {
    return getBunSqliteDatabaseAdapter({ filename })
  }
  else {
    return getBetter3DatabaseAdapter({ filename })
  }
}

const _localDatabase: Record<string, DatabaseAdapter> = {}
export async function getLocalDatabase(databaseLocation: string): Promise<LocalDevelopmentDatabase> {
  const db = _localDatabase[databaseLocation] || await getDatabase(databaseLocation)

  _localDatabase[databaseLocation] = db
  await db.exec('CREATE TABLE IF NOT EXISTS _development_cache (id TEXT PRIMARY KEY, checksum TEXT, parsedContent TEXT)')

  const fetchDevelopmentCache = async () => {
    const result = await db.all<{ id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache')
    return result.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, { checksum: string, parsedContent: string }>)
  }

  const fetchDevelopmentCacheForKey = async (key: string) => {
    return await db.first<{ id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache WHERE id = ?', [key])
  }

  const insertDevelopmentCache = async (id: string, checksum: string, parsedContent: string) => {
    deleteDevelopmentCache(id)
    db.exec(`INSERT INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
  }

  const deleteDevelopmentCache = async (id: string) => {
    db.exec(`DELETE FROM _development_cache WHERE id = '${id}'`)
  }

  const dropContentTables = async () => {
    const tables = await db.all<{ name: string }>(`SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE '_content_%'`)
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
