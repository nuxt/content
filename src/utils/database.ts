import { mkdir } from 'node:fs/promises'
import type { Connector } from 'db0'
import type { Resolver } from '@nuxt/kit'
import cloudflareD1Connector from 'db0/connectors/cloudflare-d1'
import { isAbsolute, join, dirname } from 'pathe'
import { isWebContainer } from '@webcontainer/env'
import type { CacheEntry, D1DatabaseConfig, LocalDevelopmentDatabase, SqliteDatabaseConfig } from '../types'
import type { ModuleOptions } from '../types/module'
import type { ResolvedCollection } from '../module'
import { logger } from './dev'

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

export function resolveDatabaseAdapter(adapter: 'sqlite' | 'bunsqlite' | 'postgres' | 'libsql' | 'd1' | 'nodesqlite', opts: { resolver: Resolver, nativeSqlite?: boolean }) {
  const databaseConnectors = {
    sqlite: findBestSqliteAdapter({ nativeSqlite: opts.nativeSqlite }),
    nodesqlite: 'db0/connectors/node-sqlite',
    bunsqlite: opts.resolver.resolve('./runtime/internal/connectors/bunsqlite'),
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

async function getDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig, opts: { nativeSqlite?: boolean }): Promise<Connector> {
  if (database.type === 'd1') {
    return cloudflareD1Connector({ bindingName: database.bindingName })
  }

  return import(findBestSqliteAdapter(opts))
    .then((m) => {
      const connector = (m.default || m) as (config: unknown) => Connector
      return connector({ path: database.filename })
    })
}

const _localDatabase: Record<string, Connector> = {}
export async function getLocalDatabase(database: SqliteDatabaseConfig | D1DatabaseConfig, { connector, nativeSqlite }: { connector?: Connector, nativeSqlite?: boolean } = {}): Promise<LocalDevelopmentDatabase> {
  const databaseLocation = database.type === 'sqlite' ? database.filename : database.bindingName
  const db = _localDatabase[databaseLocation] || connector || await getDatabase(database, { nativeSqlite })

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

  const dropOldContentTables = async (collections: ResolvedCollection[]) => {
    const tables = await db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name LIKE ?')
      .all('table', '_content_%') as { name: string }[]
    const upToDateTables = new Set<string>()
    for (const { name } of tables) {
      if (collections.some(c => c.tableName === name)) {
        upToDateTables.add(name)
        continue
      }
      db.exec(`DROP TABLE ${name}`)
    }
    return {
      upToDateTables: upToDateTables.values().toArray(),
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
    dropOldContentTables,
  }
}

function findBestSqliteAdapter(opts: { nativeSqlite?: boolean }) {
  if (process.versions.bun) {
    return 'db0/connectors/bun-sqlite'
  }

  // if node:sqlite is available, use it
  if (opts.nativeSqlite && isNodeSqliteAvailable()) {
    return 'db0/connectors/node-sqlite'
  }

  return isSqlite3Available() ? 'db0/connectors/sqlite3' : 'db0/connectors/better-sqlite3'
}

function isNodeSqliteAvailable() {
  try {
    const module = globalThis.process?.getBuiltinModule?.('node:sqlite')

    if (module) {
      // When using the SQLite Node.js prints warnings about the experimental feature
      // This is workaround to surpass the SQLite warning
      // Inspired by Yarn https://github.com/yarnpkg/berry/blob/182046546379f3b4e111c374946b32d92be5d933/packages/yarnpkg-pnp/sources/loader/applyPatch.ts#L307-L328
      const originalEmit = process.emit
      // @ts-expect-error - TS complains about the return type of originalEmit.apply
      process.emit = function (...args) {
        const name = args[0]
        const data = args[1] as { name: string, message: string }
        if (
          name === `warning`
          && typeof data === `object`
          && data.name === `ExperimentalWarning`
          && data.message.includes(`SQLite is an experimental feature`)
        ) {
          return false
        }
        return originalEmit.apply(process, args as unknown as Parameters<typeof process.emit>)
      }

      return true
    }

    return false
  }
  catch {
    return false
  }
}

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
