import { mkdir } from 'node:fs/promises'
import type { Connector } from 'db0'
import type { Resolver } from '@nuxt/kit'
import cloudflareD1Connector from 'db0/connectors/cloudflare-d1'
import { isAbsolute, join, dirname } from 'pathe'
import { isWebContainer } from '@webcontainer/env'
import type { CacheEntry, D1DatabaseConfig, LocalDevelopmentDatabase, ResolvedCollection, SqliteDatabaseConfig } from '../types'
import type { ModuleOptions, SQLiteConnector } from '../types/module'
import { generateCollectionInsert, generateCollectionTableDefinition } from './collection'
import { isNodeSqliteAvailable, ensurePackageInstalled } from './dependencies'

/**
 * Database version is used to identify schema changes
 * and drop the info table when the version is not supported
 */
export const databaseVersion = 'v3.5.0'

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

export async function resolveDatabaseAdapter(adapter: 'sqlite' | 'bunsqlite' | 'postgres' | 'libsql' | 'd1' | 'nodesqlite', opts: { resolver: Resolver, sqliteConnector?: SQLiteConnector }) {
  const databaseConnectors = {
    nodesqlite: 'db0/connectors/node-sqlite',
    bunsqlite: opts.resolver.resolve('./runtime/internal/connectors/bun-sqlite'),
    postgres: 'db0/connectors/postgresql',
    libsql: 'db0/connectors/libsql/web',
    d1: 'db0/connectors/cloudflare-d1',
  }

  adapter = adapter || 'sqlite'
  if (adapter === 'sqlite' && process.versions.bun) {
    return databaseConnectors.bunsqlite
  }

  if (adapter === 'sqlite') {
    return await findBestSqliteAdapter({ sqliteConnector: opts.sqliteConnector, resolver: opts.resolver })
  }

  return databaseConnectors[adapter]
}

async function getDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig, opts: { sqliteConnector?: SQLiteConnector }): Promise<Connector> {
  if (database.type === 'd1') {
    return cloudflareD1Connector({ bindingName: database.bindingName })
  }

  return import(await findBestSqliteAdapter(opts))
    .then((m) => {
      const connector = (m.default || m) as (config: unknown) => Connector
      return connector({ path: database.filename })
    })
}

const _localDatabase: Record<string, Connector> = {}
export async function getLocalDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig, { connector, sqliteConnector }: { connector?: Connector, nativeSqlite?: boolean, sqliteConnector?: SQLiteConnector } = {}): Promise<LocalDevelopmentDatabase> {
  const databaseLocation = database.type === 'sqlite' ? database.filename : database.bindingName
  const db = _localDatabase[databaseLocation] || connector || await getDatabase(database, { sqliteConnector })
  const cacheCollection = {
    tableName: '_development_cache',
    extendedSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/cache',
      definitions: {
        cache: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            value: { type: 'string' },
            checksum: { type: 'string' },
          },
          required: ['id', 'value', 'checksum'],
        },
      },
    },
    fields: {
      id: 'string',
      value: 'string',
      checksum: 'string',
    },
  } as unknown as ResolvedCollection

  // If the database is already initialized, we need to drop the cache table
  if (!_localDatabase[databaseLocation]) {
    _localDatabase[databaseLocation] = db

    let dropCacheTable = false
    try {
      dropCacheTable = await db.prepare('SELECT * FROM _development_cache WHERE id = ?')
        .get('__DATABASE_VERSION__').then(row => (row as unknown as { value: string })?.value !== databaseVersion)
    }
    catch {
      dropCacheTable = true
    }

    const initQueries = generateCollectionTableDefinition(cacheCollection, { drop: Boolean(dropCacheTable) })
    for (const query of initQueries.split('\n')) {
      await db.exec(query)
    }
    // Initialize the database version
    if (dropCacheTable) {
      await db.exec(generateCollectionInsert(cacheCollection, { id: '__DATABASE_VERSION__', value: databaseVersion, checksum: databaseVersion }).queries[0]!)
    }
  }

  const fetchDevelopmentCache = async () => {
    const result = await db.prepare('SELECT * FROM _development_cache').all() as CacheEntry[]
    return result.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, CacheEntry>)
  }

  const fetchDevelopmentCacheForKey = async (id: string) => {
    return await db.prepare('SELECT * FROM _development_cache WHERE id = ?').get(id) as CacheEntry | undefined
  }

  const insertDevelopmentCache = async (id: string, value: string, checksum: string) => {
    deleteDevelopmentCache(id)
    const insert = generateCollectionInsert(cacheCollection, { id, value, checksum })
    for (const query of insert.queries) {
      await db.exec(query)
    }
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
      Reflect.deleteProperty(_localDatabase, databaseLocation)
    },
    fetchDevelopmentCache,
    fetchDevelopmentCacheForKey,
    insertDevelopmentCache,
    deleteDevelopmentCache,
    dropContentTables,
  }
}

async function findBestSqliteAdapter(opts: { sqliteConnector?: SQLiteConnector, resolver?: Resolver }) {
  if (process.versions.bun) {
    return opts.resolver ? opts.resolver.resolve('./runtime/internal/connectors/bun-sqlite') : 'db0/connectors/bun-sqlite'
  }

  // if node:sqlite is available, use it
  if (opts.sqliteConnector === 'native' && isNodeSqliteAvailable()) {
    return opts.resolver ? opts.resolver.resolve('./runtime/internal/connectors/node-sqlite') : 'db0/connectors/node-sqlite'
  }

  if (opts.sqliteConnector === 'sqlite3') {
    return 'db0/connectors/sqlite3'
  }

  if (opts.sqliteConnector === 'better-sqlite3') {
    await ensurePackageInstalled('better-sqlite3')

    return 'db0/connectors/better-sqlite3'
  }

  if (isWebContainer()) {
    await ensurePackageInstalled('sqlite3')

    return 'db0/connectors/sqlite3'
  }

  await ensurePackageInstalled('better-sqlite3')

  return 'db0/connectors/better-sqlite3'
}
