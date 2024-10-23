import type { D1DatabaseConfig, SqliteDatabaseConfig, DatabaseAdapter, DatabaseAdapterConfig } from '@nuxt/content'
import type { H3Event } from 'h3'
import { decompressSQLDump } from './dump'
import { tables } from '#content/manifest'

export default function loadDatabaseAdapter(config: { database: DatabaseAdapterConfig, localDatabase: SqliteDatabaseConfig }) {
  const { database, localDatabase } = config

  let adapter: DatabaseAdapter
  async function loadAdapter() {
    if (!adapter) {
      if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
        adapter = await loadSqliteAdapter(localDatabase)
      }
      else if (database.type === 'sqlite') {
        adapter = await loadSqliteAdapter(database)
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

  const before = await db.first<{ version: string }>(`select * from ${tables._info}`).catch(() => ({ version: '' }))
  if (before?.version) {
    if (before?.version === integrityVersion) {
      return true
    }
    // Delete old version
    await db.exec(`DELETE FROM ${tables._info} WHERE version = '${before.version}'`)
  }

  const dump = await loadDatabaseDump(event).then(decompressSQLDump)

  await dump.reduce(async (prev: Promise<void>, sql: string) => {
    await prev
    await db.exec(sql).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      console.log('Failed to execute SQL', message.split(':').pop()?.trim())
      // throw error
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`select * from ${tables._info}`).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}

async function loadDatabaseDump(event: H3Event): Promise<string> {
  if (event?.context?.cloudflare?.env.ASSETS) {
    const url = new URL(event.context.cloudflare.request.url)
    url.pathname = '/compressed.sql'
    return await event.context.cloudflare.env.ASSETS.fetch(url).then((r: Response) => r.text())
  }

  return await $fetch('/api/content/database.sql').catch((e) => {
    console.error('Failed to fetch compressed dump', e)
    return ''
  })
}

function loadD1Database(config: D1DatabaseConfig) {
  return import('../adapters/d1').then(m => m.default(config))
}

function loadSqliteAdapter(config: SqliteDatabaseConfig) {
  return import('../adapters/sqlite').then(m => m.default(config))
}
