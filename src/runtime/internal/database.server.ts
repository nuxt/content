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
 * Remote databases (e.g. Cloudflare D1) are filled lazily, by the first requests after a deployment.
 * Any of those requests can be cancelled at any point, so the import is built to survive it:
 *
 * - `_content_info` row `checksum_<collection>` holds the imported version, `ready` is set once the import completed.
 * - `_content_info` row `lease_<collection>` exists while a request imports the collection: `version` holds the
 *   owner token and `structureVersion` the expiry time. Inserting it is the atomic claim (primary key) on every
 *   database, the owner extends it while it makes progress and anyone may remove it once it has expired.
 *   An owner that lost its lease stops before it can flag the collection as ready.
 * - Within an isolate, requests share a single check. The check reports progress each time a database call
 *   completes, and a caller that sees no progress for `STALL_TIMEOUT` (its owner was cancelled) starts a new one.
 */
type WaitUntil = (promise: Promise<unknown>) => void

interface IntegrityCheck {
  promise: Promise<void>
  lastProgress: number
  token: string
}

interface InfoRow {
  version: string
  structureVersion: string
  ready: boolean
}

const integrityChecks = new Map<string, IntegrityCheck>()

/**
 * A check that made no progress for this long is considered dead
 */
const STALL_TIMEOUT = 30_000

/**
 * Lifetime of an import lease, extended every `LEASE_RENEW_INTERVAL` by its owner
 */
const LEASE_TTL = 30_000
const LEASE_RENEW_INTERVAL = 10_000

/**
 * Timeout for waiting for another request to finish the database initialization
 */
const REQUEST_TIMEOUT = 90

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
    console.warn(`Database integrity check of "${collection}" stalled, starting a new one`)
    // Hand its lease over right away instead of waiting for it to expire, its owner would stop at the next renewal
    await loadDatabaseAdapter(config)
      .then(db => createLease(db, collection, check!.token).release())
      .catch(() => {})
  }
}

function startIntegrityCheck(event: H3Event, collection: string, config: RuntimeConfig['content']): IntegrityCheck {
  const check: IntegrityCheck = { promise: Promise.resolve(), lastProgress: Date.now(), token: createToken() }

  check.promise = _checkAndImportDatabaseIntegrity(event, collection, checksums[collection]!, checksumsStructure[collection]!, config, check)
    .then(() => {})
    .catch((error) => {
      console.error('Database integrity check failed', error)
      // allow the next request to try again
      if (integrityChecks.get(collection) === check) {
        integrityChecks.delete(collection)
      }
    })

  // Keep the import running when the client disconnects (Cloudflare `ctx.waitUntil`, through Nitro)
  const waitUntil = (event as { waitUntil?: WaitUntil } | undefined)?.waitUntil || (event?.context as { waitUntil?: WaitUntil } | undefined)?.waitUntil
  waitUntil?.(check.promise)

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

async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, structureIntegrityVersion: string, config: RuntimeConfig['content'], check: IntegrityCheck) {
  const adapter = await loadDatabaseAdapter(config)
  const progress = () => {
    check.lastProgress = Date.now()
  }
  // every completed database call proves that the request which runs the check is still alive
  const db: DatabaseAdapter = {
    all: (sql, params) => adapter.all(sql, params).finally(progress) as never,
    first: (sql, params) => adapter.first(sql, params).finally(progress) as never,
    exec: (sql, params) => adapter.exec(sql, params).finally(progress),
  }

  const readChecksum = () => db.first<InfoRow>(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch((): null => null)
  const isReady = (row: InfoRow | null | undefined) => !!row?.ready && row.version === integrityVersion

  let dump: Promise<string[]> | undefined
  const getDump = () => {
    dump ||= loadDatabaseDump(event, collection).then(decompressSQLDump).finally(progress)
    return dump
  }

  let before = await readChecksum()

  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    // database version is not supported, drop the info table
    await db.exec(`DROP TABLE IF EXISTS ${tables.info}`)
    before = null
  }

  if (isReady(before)) {
    // table is already initialized and ready, use it
    return true
  }

  if (!before) {
    // the info table may not exist yet: it holds the leases, so create it first (first line of the dump)
    const infoTable = splitDumpLine((await getDump())[0] || '')
    if (infoTable.hash === 'structure' && infoTable.statement.includes(` ${tables.info} `)) {
      await db.exec(infoTable.statement).catch(() => {})
    }
  }

  // Only one request imports a collection at a time, the others wait for it to finish.
  // A lease left by a request that was cancelled expires and is taken over.
  const lease = createLease(db, collection, check.token)
  const deadline = Date.now() + REQUEST_TIMEOUT * 1000
  while (!(await lease.acquire())) {
    if (Date.now() > deadline) {
      throw new Error('Waiting for another database initialization timed out')
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (isReady(await readChecksum())) {
      return true
    }
  }

  try {
    // the collection may have been imported while this request was waiting for the lease
    before = await readChecksum()
    if (isReady(before)) {
      return true
    }

    await importCollection(db, collection, before, structureIntegrityVersion, await getDump(), lease)
  }
  finally {
    await lease.release()
  }

  const after = await db.first<{ version: string }>(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}

async function importCollection(db: DatabaseAdapter, collection: string, before: InfoRow | null | undefined, structureIntegrityVersion: string, dump: string[], lease: Lease) {
  // A row that is not ready comes from an import that never finished: the table is not guaranteed
  // to exist or to have the expected structure, so never reuse it.
  const unchangedStructure = !!before?.ready && before.structureVersion === structureIntegrityVersion

  if (before) {
    // Delete old version -- checksum exists but does not match with bundled checksum (or its import never finished)
    await db.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`])

    if (!unchangedStructure) {
      // we need to drop the table and recreate it
      await db.exec(`DROP TABLE IF EXISTS ${tables[collection]}`)
    }
  }

  const lines = dump.map(splitDumpLine)
  let hashesInDb = new Set<string>()

  if (unchangedStructure) {
    // get the list of hash to insert
    const hashListFromTheDump = new Set(lines.map(line => line.hash))

    // get the list of hash in the database
    const hashesInDbRecords = await db.all<{ __hash__: string }>(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => [] as { __hash__: string }[])
    hashesInDb = new Set(hashesInDbRecords.map(r => r.__hash__))

    // get the list of hash to delete
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump)
    if (hashesToDelete.size) {
      await db.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill('?').join(',')})`, Array.from(hashesToDelete))
    }
  }

  let renewedAt = Date.now()
  for (const [index, { statement, hash }] of lines.entries()) {
    // If the structure has not changed,
    // skip any insert/update line whose hash is already in the database.
    // If not, since we dropped the table, no record is skipped, insert them all again.
    if (unchangedStructure) {
      // Skip any line that is structure related:
      // since the structure is unchanged
      if (hash === 'structure') {
        continue
      }

      // Skip any record whose hash is already in the DB:
      // We do not need to insert what is already there
      if (hashesInDb.has(hash)) {
        continue
      }
    }

    // Keep the lease alive, and make sure it is still ours before flagging the collection as ready (last line)
    if (index === lines.length - 1 || Date.now() - renewedAt > LEASE_RENEW_INTERVAL) {
      await lease.renew()
      renewedAt = Date.now()
    }

    await db.exec(statement).catch((err: Error) => {
      const message = err.message || 'Unknown error'
      console.error(`Failed to execute SQL ${statement}: ${message}`)
    })
  }
}

/**
 * In D1, there is a bug where semicolons and comments can't work together
 * so we need to split the SQL and remove the comment
 * @see https://github.com/cloudflare/workers-sdk/issues/3892
 */
function splitDumpLine(sql: string) {
  const hash = sql.split(' -- ').pop()!
  return { statement: sql.substring(0, sql.length - hash.length - 4), hash }
}

interface Lease {
  acquire: () => Promise<boolean>
  renew: () => Promise<void>
  release: () => Promise<void>
}

function createLease(db: DatabaseAdapter, collection: string, token: string): Lease {
  const id = `lease_${collection}`
  // fixed width, so that timestamps compare as strings on every database
  const expiry = (offset: number) => String(Date.now() + offset).padStart(16, '0')

  return {
    async acquire() {
      await db.exec(`DELETE FROM ${tables.info} WHERE id = ? AND "structureVersion" < ?`, [id, expiry(0)]).catch(() => {})
      return db.exec(`INSERT INTO ${tables.info} (id, ready, "structureVersion", version) VALUES (?, false, ?, ?)`, [id, expiry(LEASE_TTL), token])
        .then(() => true, () => false)
    },
    async renew() {
      await db.exec(`UPDATE ${tables.info} SET "structureVersion" = ? WHERE id = ? AND version = ?`, [expiry(LEASE_TTL), id, token])
      const row = await db.first<{ version: string }>(`SELECT version FROM ${tables.info} WHERE id = ?`, [id])
      if (row?.version !== token) {
        throw new Error(`Lost the import lease of "${collection}" to another request`)
      }
    },
    async release() {
      await db.exec(`DELETE FROM ${tables.info} WHERE id = ? AND version = ?`, [id, token]).catch(() => {})
    },
  }
}

function createToken() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
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
