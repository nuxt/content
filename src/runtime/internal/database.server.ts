import type { DatabaseAdapter, RuntimeConfig } from '@nuxt/content'
import type { H3Event } from 'h3'
import { isAbsolute } from 'pathe'
import type { Connector } from 'db0'
import type { ConnectorOptions as SqliteConnectorOptions } from 'db0/connectors/better-sqlite3'
import { decompressSQLDump } from './dump'
import { fetchDatabase } from './api'
import { refineContentFields } from './collection'
import { tables, checksums, checksumsStructure } from '#content/manifest'
import adapter from '#content/adapter'
import localAdapter from '#content/local-adapter'

let db: Connector
export default function loadDatabaseAdapter(config: RuntimeConfig['content']) {
  const { database, localDatabase } = config

  if (!db) {
    if (import.meta.dev || ['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
      db = localAdapter(refineDatabaseConfig(localDatabase))
    }
    else {
      db = adapter(refineDatabaseConfig(database))
    }
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
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params)
    },
  }
}

const checkDatabaseIntegrity = {} as Record<string, boolean>
const integrityCheckPromise = {} as Record<string, Promise<void> | null>
export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig['content']): Promise<void> {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], checksumsStructure[String(collection)], config)
      .then((isValid) => {
        checkDatabaseIntegrity[String(collection)] = !isValid
      })
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

/**
 * Timeout for waiting for another request to finish the database initialization
 */
const REQUEST_TIMEOUT = 90

async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, structureIntegrityVersion: string, config: RuntimeConfig['content']) {
  const db = loadDatabaseAdapter(config)

  const before = await db.first<{ version: string, structureVersion: string, ready: boolean }>(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch((): null => null)

  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    // database version is not supported, drop the info table
    await db.exec(`DROP TABLE IF EXISTS ${tables.info}`)
    before.version = ''
  }

  const unchangedStructure = before?.structureVersion === structureIntegrityVersion

  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        // table is already initialized and ready, use it
        return true
      }

      // if another request has already started the initialization of
      // this version of this collection, wait for it to finish
      // then respond that the database is ready
      // NOTE: only wait if the version is the same so if the previous init
      // was interrupted or has failed, it will not block the new init
      let iterationCount = 0
      await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          const { ready } = await db.first<{ ready: boolean }>(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }))

          if (ready) {
            clearInterval(interval)
            resolve(0)
          }

          // after timeout is reached, give up and stop the query
          // it has to be that initialization has failed
          if (iterationCount++ > REQUEST_TIMEOUT) {
            clearInterval(interval)
            reject(new Error('Waiting for another database initialization timed out'))
          }
        }, 1000)
      }).catch((e) => {
        throw e
      })
      return true
    }

    // Delete old version -- checksum exists but does not match with bundled checksum
    await db.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`])

    if (!unchangedStructure) {
      // we need to drop the table and recreate it
      await db.exec(`DROP TABLE IF EXISTS ${tables[collection]}`)
    }
  }

  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump)

  const indexesToInsert: number[] = []
  if (unchangedStructure) {
    // get the list of hash to insert
    const hashListFromTheDump: string[] = JSON.parse(dump[0].slice(3))

    // get the list of hash in the database
    const hashesInDbRecords = await db.all<{ __hash__: string }>(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => [] as { __hash__: string }[])
    const hashesInDb = hashesInDbRecords.map(r => r.__hash__)

    // get the list of hash to delete
    const hashesToDelete = hashesInDb.filter(hash => !hashListFromTheDump.includes(hash))
    if (hashesToDelete.length) {
      await db.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${hashesToDelete.map(() => '?').join(',')})`, hashesToDelete)
    }

    // get the list indexes of the queries we will insert/update
    let listIndex = 0
    for (const hash of hashListFromTheDump) {
      const index = hashesInDb.indexOf(hash)
      // if the hash was not found in db, we will insert it
      if (index === -1) {
        indexesToInsert.push(listIndex)
      }
      listIndex++
    }
  }

  await dump.reduce(async (prev: Promise<void>, sql: string, index: number) => {
    await prev

    // skip sql comment
    if (sql.startsWith('-- ')) {
      return Promise.resolve()
    }

    // If the structure has not changed,
    // skip any insert/update line whose hash is already in the database.
    // If not, since we dropped the table, no record is skipped, insert them all again.
    if (unchangedStructure && (sql.startsWith('INSERT ') || sql.startsWith('UPDATE ')) && !indexesToInsert.includes(index)) {
      return Promise.resolve()
    }

    await db.exec(sql).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      console.error(`Failed to execute SQL ${sql}: ${message}`)
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: '' }))
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
