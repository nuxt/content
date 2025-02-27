import { mkdir } from 'node:fs/promises'
import type { Connector } from 'db0'
import type { Resolver } from '@nuxt/kit'
import cloudflareD1Connector from 'db0/connectors/cloudflare-d1'
import { isAbsolute, join, dirname } from 'pathe'
import { isWebContainer } from '@webcontainer/env'
import type { CacheEntry, D1DatabaseConfig, LocalDevelopmentDatabase, SqliteDatabaseConfig } from '../types'
import type { ModuleOptions } from '../types/module'
import { logger } from './dev'

function isSqlite3Available() {
  if (!isWebContainer()) {
    return false
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('sqlite3')
    return true
  }
  catch {
    logger.error('Nuxt Content requires `sqlite3` module to work in WebContainer environment. Please run `npm install sqlite3` to install it and try again.')
    process.exit(1)
  }
}

export async function refineDatabaseConfig(database: ModuleOptions['database'], opts: { rootDir: string, updateSqliteFileName?: boolean }) {
  if (database.type === 'd1') {
    if (!('bindingName' in database)) {
      // @ts-expect-error bindingName
      database.bindingName = database.binding
    }
  }

  if (database.type === 'sqlite') {
    const path = isAbsolute(database.filename)
      ? database.filename
      : join(opts.rootDir, database.filename)
    await mkdir(dirname(path), { recursive: true }).catch(() => {})

    if (opts.updateSqliteFileName) {
      database.filename = path
    }
  }
}

export function getDefaultSqliteAdapter() {
  return process.versions.bun ? 'bunsqlite' : 'sqlite'
}

export function resolveDatabaseAdapter(adapter: 'sqlite' | 'bunsqlite' | 'postgres' | 'libsql' | 'd1', resolver: Resolver) {
  const databaseConnectors = {
    sqlite: isSqlite3Available() ? 'db0/connectors/sqlite3' : 'db0/connectors/better-sqlite3',
    bunsqlite: resolver.resolve('./runtime/internal/connectors/bunsqlite'),
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

async function getDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig): Promise<Connector> {
  if (database.type === 'd1') {
    return cloudflareD1Connector({ bindingName: database.bindingName })
  }

  const type = getDefaultSqliteAdapter()
  return import(type === 'bunsqlite' ? 'db0/connectors/bun-sqlite' : (isSqlite3Available() ? 'db0/connectors/sqlite3' : 'db0/connectors/better-sqlite3'))
    .then((m) => {
      const connector = (m.default || m) as (config: unknown) => Connector
      return connector({ path: database.filename })
    })
}

const _localDatabase: Record<string, Connector> = {}
export async function getLocalDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig, connector?: Connector): Promise<LocalDevelopmentDatabase> {
  const databaseLocation = database.type === 'sqlite' ? database.filename : database.bindingName
  const db = _localDatabase[databaseLocation] || connector || await getDatabase(database)

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
    db.prepare(`INSERT INTO _development_cache (id, checksum, parsedContent) VALUES (?, ?, ?)`)
      .run(id, checksum, parsedContent)
  }

  const deleteDevelopmentCache = async (id: string) => {
    db.prepare(`DELETE FROM _development_cache WHERE id = ?`).run(id)
  }

  const dropContentTables = async () => {
    const tables = await db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name LIKE ?')
      .all('table', '_content_%') as { name: string }[]
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
