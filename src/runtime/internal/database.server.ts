import type { D1DatabaseConfig, SqliteDatabaseConfig, DatabaseAdapter, DatabaseAdapterConfig } from '@nuxt/content'
import type { H3Event } from 'h3'
import { getTableName } from './app'
import { decompressSQLDump } from './dump'
import { loadDatabaseDump } from './app.server'

export function loadD1Database(config: D1DatabaseConfig) {
  return import('../server/adapters/d1').then(m => m.default(config))
}

export function loadSqliteAdapter(config: SqliteDatabaseConfig) {
  return import('../server/adapters/sqlite').then(m => m.default(config))
}

export default function loadDatabaseAdapter(config: { database: DatabaseAdapterConfig, localDatabase: SqliteDatabaseConfig }) {
  const { database, localDatabase } = config

  let adapter: DatabaseAdapter
  async function loadAdapter() {
    if (!adapter) {
      if (database.type === 'sqlite') {
        adapter = await loadSqliteAdapter(database)
      }
      else if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
        adapter = await loadSqliteAdapter(localDatabase)
      }
      else if (database.type === 'd1') {
        adapter = await loadD1Database(database)
      }
      else {
        adapter = await loadSqliteAdapter(localDatabase)
      }
    }
    return adapter
  }

  return <DatabaseAdapter>{
    all: async (sql, params) => {
      if (!adapter) {
        await loadAdapter()
      }
      return await adapter.all<Record<string, unknown>>(sql, params)
    },
    first: async (sql, params) => {
      if (!adapter) {
        await loadAdapter()
      }
      return await adapter.first<Record<string, unknown>>(sql, params)
    },
    exec: async (sql) => {
      if (!adapter) {
        await loadAdapter()
      }
      return adapter.exec(sql)
    },
  }
}

export async function checkAndImportDatabaseIntegrity(event: H3Event, integrityVersion: string, config: { database: DatabaseAdapterConfig, localDatabase: SqliteDatabaseConfig }) {
  const db = await loadDatabaseAdapter(config)

  const before = await db.first<{ version: string }>(`select * from ${getTableName('_info')}`).catch(() => ({ version: '' }))
  if (before?.version) {
    if (before?.version === integrityVersion) {
      return true
    }
    // Delete old version
    await db.exec(`DELETE FROM ${getTableName('_info')} WHERE version = '${before.version}'`)
  }

  const dump = await loadDatabaseDump(event).then(decompressSQLDump)

  await dump.reduce(async (prev: Promise<void>, sql: string) => {
    await prev
    await db.exec(sql).catch((err) => {
      const message = err.message || 'Unknown error'
      console.log('Failed to execute SQL', message.split(':').pop().trim())
      // throw error
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`select * from ${getTableName('_info')}`).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}
