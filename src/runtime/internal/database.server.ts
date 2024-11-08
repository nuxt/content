import type { SqliteDatabaseConfig, DatabaseAdapter, RuntimeConfig } from '@nuxt/content'
import type { H3Event } from 'h3'
import { decompressSQLDump } from './dump'
import { fetchDatabase } from './api'
import { tables, checksums } from '#content/manifest'
import adapter from '#content/adapter'

export default function loadDatabaseAdapter(config: RuntimeConfig) {
  const { database, localDatabase } = config

  let _adapter: DatabaseAdapter
  async function loadAdapter() {
    if (!_adapter) {
      if (import.meta.dev || ['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
        _adapter = await loadSqliteAdapter(localDatabase)
      }
      else {
        _adapter = adapter(database)
      }
    }

    return _adapter
  }

  return <DatabaseAdapter>{
    all: async (sql, params) => {
      const db = await loadAdapter()
      return await db.all<Record<string, unknown>>(sql, params)
    },
    first: async (sql, params) => {
      const db = await loadAdapter()
      return await db.first<Record<string, unknown>>(sql, params)
    },
    exec: async (sql) => {
      const db = await loadAdapter()
      return db.exec(sql)
    },
  }
}

const checkDatabaseIntegrity = {} as Record<string, boolean>
const integrityCheckPromise = {} as Record<string, Promise<void> | null>
export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig): Promise<void> {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], config)
      .then((isValid) => { checkDatabaseIntegrity[String(collection)] = !isValid })
      .catch((error) => {
        console.log('Database integrity check failed', error)
        checkDatabaseIntegrity[String(collection)] = true
        integrityCheckPromise[String(collection)] = null
      })
  }

  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)]
  }
}

async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, config: RuntimeConfig) {
  const db = await loadDatabaseAdapter(config)

  const before = await db.first<{ version: string }>(`select * from ${tables.info} where id = 'checksum_${collection}'`).catch(() => ({ version: '' }))
  console.log(`checkAndImportDatabaseIntegrity: ${collection}, before: ${before?.version}, now: ${integrityVersion}`)

  if (before?.version) {
    if (before?.version === integrityVersion) {
      return true
    }
    // Delete old version
    await db.exec(`DELETE FROM ${tables.info} WHERE id = 'checksum_${collection}'`)
  }

  const now = Date.now()
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump)
  console.log(`loadDatabaseDump: ${Date.now() - now}ms`)

  await dump.reduce(async (prev: Promise<void>, sql: string) => {
    await prev
    await db.exec(sql).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      // console.log('Failed to execute SQL', message.split(':').pop()?.trim())
      console.log(`Failed to execute SQL ${sql}: ${message}`)
      // throw error
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`SELECT * FROM ${tables.info} WHERE id = 'checksum_${collection}'`).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}

async function loadDatabaseDump(event: H3Event, collection: string): Promise<string> {
  return await fetchDatabase(event, String(collection))
    .catch((e) => {
      console.error('Failed to fetch compressed dump', e)
      return ''
    })
}

function loadSqliteAdapter(config: SqliteDatabaseConfig) {
  return import('../adapters/sqlite').then(m => m.default(config))
}
