import type { H3Event } from 'h3'
import { isAbsolute } from 'pathe'
import type { Connector } from 'db0'
import { decompressSQLDump } from './dump'
import { fetchDatabase } from './api'
import { refineContentFields } from './collection'
import type { DatabaseAdapter, RuntimeConfig } from '@nuxt/content'
import { tables, checksums, checksumsStructure } from '#content/manifest'
import localAdapter from '#content/local-adapter'

let db: Connector
let _adapterPromise: Promise<(opts: unknown) => Connector> | undefined
let _databasePromise: Promise<Connector> | undefined

function getAdapter(): Promise<(opts: unknown) => Connector> {
  if (!_adapterPromise) {
    _adapterPromise = import('#content/adapter').then(m => m.default || m)
  }
  return _adapterPromise
}

async function getDatabase(config: RuntimeConfig['content']): Promise<Connector> {
  if (db) {
    return db
  }

  if (!_databasePromise) {
    _databasePromise = (async () => {
      const { database, localDatabase } = config

      if (import.meta.dev || ['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
        return localAdapter(refineDatabaseConfig(localDatabase))
      }

      const adapter = await getAdapter()
      return adapter(refineDatabaseConfig(database))
    })().catch((error) => {
      // Allow a later request to retry initialization after a transient failure.
      _databasePromise = undefined
      throw error
    })
  }

  db = await _databasePromise
  return db
}

export default async function loadDatabaseAdapter(config: RuntimeConfig['content']) {
  await getDatabase(config)

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

/**
 * An integrity check is shared by every request of an isolate, so a request that is
 * cancelled while it runs would leave everybody else awaiting a promise that never settles.
 * The check reports progress (`lastProgress`) each time a database call completes, and
 * a caller that sees no progress for `STALL_TIMEOUT` stops waiting and starts a new check.
 */
interface IntegrityCheck {
  promise: Promise<void>
  lastProgress: number
}
const integrityChecks = new Map<string, IntegrityCheck>()
// collections whose check stalled in this isolate: the `ready = 0` row they left is not worth waiting for
const abandonedChecks = new Set<string>()

/**
 * A check that made no progress for this long is considered dead
 */
const STALL_TIMEOUT = 30_000

export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig['content']): Promise<void> {
  while (true) {
    let check = integrityChecks.get(collection)
    if (!check) {
      check = startIntegrityCheck(event, collection, config)
      integrityChecks.set(collection, check)
    }

    if (await settlesBeforeStalling(check)) {
      return
    }

    // The request that owns this check is gone: forget it, a new check takes over.
    // A zombie check which settles later can no longer alter the shared state.
    if (integrityChecks.get(collection) === check) {
      integrityChecks.delete(collection)
    }
    abandonedChecks.add(collection)
    console.warn(`Database integrity check of "${collection}" stalled, starting a new one`)
  }
}

function startIntegrityCheck(event: H3Event, collection: string, config: RuntimeConfig['content']): IntegrityCheck {
  const check: IntegrityCheck = { promise: Promise.resolve(), lastProgress: Date.now() }
  const progress = () => {
    check.lastProgress = Date.now()
  }

  check.promise = _checkAndImportDatabaseIntegrity(event, collection, checksums[collection]!, checksumsStructure[collection]!, config, progress)
    .then((isValid) => {
      if (isValid) {
        abandonedChecks.delete(collection)
      }
    })
    .catch((error) => {
      console.error('Database integrity check failed', error)
      // allow the next request to try again
      if (integrityChecks.get(collection) === check) {
        integrityChecks.delete(collection)
      }
    })

  return check
}

/**
 * Resolves `true` when the check settled, `false` when it has stalled.
 * The timer belongs to the caller, so it is not affected by the cancellation of the request that started the check.
 */
function settlesBeforeStalling(check: IntegrityCheck): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (Date.now() - check.lastProgress > STALL_TIMEOUT) {
        clearInterval(timer)
        resolve(false)
      }
    }, 1000)
    check.promise.then(() => {
      clearInterval(timer)
      resolve(true)
    })
  })
}

async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, structureIntegrityVersion: string, config: RuntimeConfig['content'], progress: () => void) {
  const adapter = await loadDatabaseAdapter(config)
  // every completed database call proves that the request which runs the check is still alive
  const db: DatabaseAdapter = {
    all: (sql, params) => adapter.all(sql, params).finally(progress) as never,
    first: (sql, params) => adapter.first(sql, params).finally(progress) as never,
    exec: (sql, params) => adapter.exec(sql, params).finally(progress),
  }

  const before = await db.first<{ version: string, structureVersion: string, ready: boolean }>(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch((): null => null)

  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    // database version is not supported, drop the info table
    await db.exec(`DROP TABLE IF EXISTS ${tables.info}`)
    before.version = ''
  }

  // A row that is not ready comes from an import that never finished: the table is not guaranteed
  // to exist or to have the expected structure, so never reuse it.
  const unchangedStructure = !!before?.ready && before.structureVersion === structureIntegrityVersion

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
      if (await waitUntilDatabaseIsReady(db, collection)) {
        return true
      }

      // The other initialization never finished (its request was probably cancelled),
      // fall through and take it over: drop its row and import again.
      console.warn(`Database initialization of "${collection}" did not finish, importing it again`)
    }

    // Delete old version -- checksum exists but does not match with bundled checksum (or its import never finished)
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
 * @returns `true` once the collection is ready, `false` when the initialization will not finish by itself
 */
async function waitUntilDatabaseIsReady(db: DatabaseAdapter, collection: string): Promise<boolean> {
  const deadline = Date.now() + REQUEST_TIMEOUT * 1000
  while (!abandonedChecks.has(collection) && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const row = await db.first<{ ready: boolean }>(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`])
      .catch(() => ({ ready: true }))

    if (row?.ready) {
      return true
    }

    // the row has been removed, there is nothing to wait for
    if (!row) {
      return false
    }
  }
  return false
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
    const _config = { ...config } as { path?: string, name?: string }
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
