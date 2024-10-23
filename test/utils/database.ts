import Database from 'better-sqlite3'

export const getTableName = (name: string) => `content_${name}`

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
      _localDatabase!.exec(`INSERT INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
    },
    database: _localDatabase!,
    exec: (sql: string) => {
      _localDatabase!.exec(sql)
    },
    close: () => {
      _localDatabase!.close()
      _localDatabase = undefined
    },
  }
}
