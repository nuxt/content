import type { DatabaseAdapter, RuntimeConfig } from '@nuxt/content'
import type { H3Event } from 'h3'
import { isAbsolute } from 'pathe'
import type { Connector } from 'db0'
import type { ConnectorOptions as SqliteConnectorOptions } from 'db0/connectors/better-sqlite3'
import { decompressSQLDump } from './dump'
import { fetchDatabase } from './api'
import { refineContentFields } from './collection'
import { tables, checksums } from '#content/manifest'
import adapter from '#content/adapter'
import localAdapter from '#content/local-adapter'

export default function loadDatabaseAdapter(config: RuntimeConfig['content']) {
  const { database, localDatabase } = config

  let db: Connector
  if (import.meta.dev || ['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
    db = localAdapter(refineDatabaseConfig(localDatabase))
  }
  else {
    db = adapter(refineDatabaseConfig(database))
  }

  return <DatabaseAdapter>{
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params)
        .then(result => 'results' in result && Array.isArray(result.results) ? result.results : result)
        .then(result => (result || []).map((item: unknown) => refineContentFields(sql, item)))
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params)
        .then(item => item ? refineContentFields(sql, item) : item)
    },
    exec: async (sql) => {
      return db.exec(sql)
    },
  }
}

const checkDatabaseIntegrity = {} as Record<string, boolean>
const integrityCheckPromise = {} as Record<string, Promise<void> | null>
export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig['content']): Promise<void> {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], config)
      .then((isValid) => { checkDatabaseIntegrity[String(collection)] = !isValid })
      .catch((error) => {
        console.error('Database integrity check failed', error)
        checkDatabaseIntegrity[String(collection)] = true
        integrityCheckPromise[String(collection)] = null
      })
  }

  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)]
  }
}

async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, config: RuntimeConfig['content']) {
  const db = loadDatabaseAdapter(config)

  const before = await db.first<{ version: string }>(`select * from ${tables.info} where id = 'checksum_${collection}'`).catch(() => ({ version: '' }))

  if (before?.version) {
    if (before?.version === integrityVersion) {
      return true
    }
    // Delete old version
    await db.exec(`DELETE FROM ${tables.info} WHERE id = 'checksum_${collection}'`)
  }

  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump)

  await dump.reduce(async (prev: Promise<void>, sql: string) => {
    await prev
    await db.exec(sql).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      console.error(`Failed to execute SQL ${sql}: ${message}`)
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

function refineDatabaseConfig(config: RuntimeConfig['content']['database']) {
  if (config.type === 'd1') {
    return { ...config, bindingName: config.bindingName || config.binding }
  }

  if (config.type === 'sqlite') {
    const _config = { ...config } as SqliteConnectorOptions
    if (config.filename === ':memory:') {
      return { name: 'memory' }
    }

    if ('filename' in config) {
      const filename = isAbsolute(config?.filename || '') || config?.filename === ':memory:'
        ? config?.filename
        : new URL(config.filename, (globalThis as unknown as { _importMeta_: { url: string } })._importMeta_.url).pathname

      _config.path = process.platform === 'win32' && filename.startsWith('/') ? filename.slice(1) : filename
    }
    return _config
  }

  return config
}
