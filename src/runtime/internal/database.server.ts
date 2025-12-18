import type { H3Event } from 'h3'
import { isAbsolute } from 'pathe'
import type { Connector } from 'db0'
import type { ConnectorOptions as SqliteConnectorOptions } from 'db0/connectors/better-sqlite3'
import { decompressSQLDump } from './dump'
import { fetchDatabase } from './api'
import { refineContentFields } from './collection'
import type { DatabaseAdapter, RuntimeConfig } from '@nuxt/content'
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

const checkDatabaseIntegrity = new Map<string, boolean>()
const integrityCheckPromise = new Map<string, Promise<void> | null>()
export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig['content']): Promise<void> {
  if (checkDatabaseIntegrity.get(collection) !== false) {
    checkDatabaseIntegrity.set(collection, false)
    if (!integrityCheckPromise.has(collection)) {
      const _integrityCheck = _checkAndImportDatabaseIntegrity(event, collection, checksums[collection]!, checksumsStructure[collection]!, config)
        .then((isValid) => {
          checkDatabaseIntegrity.set(collection, !isValid)
        })
        .catch((error) => {
          console.error('Database integrity check failed', error)
          checkDatabaseIntegrity.set(collection, true)
          integrityCheckPromise.delete(collection)
        })

      integrityCheckPromise.set(collection, _integrityCheck)
    }
  }

  if (integrityCheckPromise.has(collection)) {
    await integrityCheckPromise.get(collection)!
  }
}

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
      await waitUntilDatabaseIsReady(db, collection)

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
  const dumpLinesHash = dump.map(row => row.split(' -- ').pop())
  let hashesInDb = new Set<string>()

  if (unchangedStructure) {
    // get the list of hash to insert
    const hashListFromTheDump = new Set(dumpLinesHash)

    // get the list of hash in the database
    const hashesInDbRecords = await db.all<{ __hash__: string }>(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => [] as { __hash__: string }[])
    hashesInDb = new Set(hashesInDbRecords.map(r => r.__hash__))

    // get the list of hash to delete
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump)
    if (hashesToDelete.size) {
      await db.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill('?').join(',')})`, Array.from(hashesToDelete))
    }
  }

  await dump.reduce(async (prev: Promise<void>, sql: string, index: number) => {
    await prev

    // in D1, there is a bug where semicolons and comments can't work together
    // so we need to split the SQL and remove the comment
    // @see https://github.com/cloudflare/workers-sdk/issues/3892
    const hash = dumpLinesHash[index]!
    const statement = sql.substring(0, sql.length - hash.length - 4)

    // If the structure has not changed,
    // skip any insert/update line whose hash is already in the database.
    // If not, since we dropped the table, no record is skipped, insert them all again.
    if (unchangedStructure) {
      // Skip any line that is structure related:
      // since the structure is unchanged
      if (hash === 'structure') {
        return Promise.resolve()
      }

      // Skip any record whose hash is already in the DB:
      // We do not need to insert what is already there
      if (hashesInDb.has(hash)) {
        return Promise.resolve()
      }
    }

    await db.exec(statement).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      console.error(`Failed to execute SQL ${sql}: ${message}`)
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}

/**
 * Timeout for waiting for another request to finish the database initialization
 */
const REQUEST_TIMEOUT = 90

/**
 * Wait until another request has finished the database initialization
 * @param db - Database adapter
 * @param collection - Collection name
 */
async function waitUntilDatabaseIsReady(db: DatabaseAdapter, collection: string) {
  let iterationCount = 0
  let interval: NodeJS.Timer
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db.first<{ ready: boolean }>(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`])
        .catch(() => ({ ready: true }))

      if (row?.ready) {
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
  }).finally(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
}

async function loadDatabaseDump(event: H3Event, collection: string): Promise<string> {
  return await fetchDatabase(event, collection)
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
      return { name: ':memory:' }
    }

    if ('filename' in config) {
      const filename = isAbsolute(config?.filename || '') || config?.filename === ':memory:'
        ? config?.filename
        : new URL(config.filename, (globalThis as unknown as { _importMeta_: { url: string } })._importMeta_.url).pathname

      _config.path = process.platform === 'win32' && filename.startsWith('/') ? filename.slice(1) : filename
    }
    return _config
  }

  if (config.type === 'pglite') {
    // PGlite uses dataDir for storage location
    // If no dataDir is provided, it will use in-memory storage
    return {
      dataDir: config.dataDir,
      // Pass through any other PGlite-specific options
      ...config,
    }
  }

  return config
}
