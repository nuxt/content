import { createError } from 'h3'
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
 * Any of those requests can be cancelled or killed at any point, so the import is built to survive it:
 *
 * - `_content_info` row `checksum_<collection>` holds the imported version, `ready` is set once the import completed.
 * - `_content_info` row `lease_<collection>` exists while a request imports the collection: `version` holds the
 *   owner token and `structureVersion` the expiry time. Inserting it is the atomic claim (primary key) on every
 *   database, the owner extends it while it makes progress and anyone may remove it once it has expired.
 *   The owner confirms it still holds the lease before every destructive statement and before flagging
 *   the collection as ready, so an owner that lost its lease cannot damage the import that replaced it.
 * - The collection is flagged as ready only when every statement succeeded and the table holds exactly the
 *   records of the dump. Anything else fails the check, and the next request (after `RETRY_DELAY`) tries again.
 * - Within an isolate, requests share a single check. The check reports progress each time a database call
 *   completes, and a caller that sees no progress for `STALL_TIMEOUT` (its owner was cancelled) starts a new one.
 * - Requests are never served from a collection that is not ready: they wait for the import, or fail with a 503.
 */
type WaitUntil = (promise: Promise<unknown>) => void

interface IntegrityCheck {
  promise: Promise<boolean>
  lastProgress: number
  token: string
  failedAt?: number
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

/**
 * After a failed check, requests fail fast for this long before a new check is started
 */
const RETRY_DELAY = 10_000

/**
 * Attempts for each statement of the import, to ride out transient database errors
 */
const STATEMENT_ATTEMPTS = 3

/**
 * D1 accepts at most 100 bound parameters per statement
 */
const MAX_BOUND_PARAMETERS = 100

/**
 * Makes sure the collection is imported and ready before it is queried: imports it when needed,
 * or waits for the request that imports it. Requests of an isolate share a single check.
 * @param event - Request that needs the collection
 * @param collection - Collection name
 * @param config - Content runtime config
 * @throws A 503 error when the collection cannot be made ready (failed or never-ending import)
 */
export async function checkAndImportDatabaseIntegrity(event: H3Event, collection: string, config: RuntimeConfig['content']): Promise<void> {
  // a check whose owner was cancelled is replaced, a few times at most
  for (let attempt = 0; attempt < 3; attempt++) {
    let check = integrityChecks.get(collection)
    if (check?.failedAt && Date.now() - check.failedAt > RETRY_DELAY) {
      integrityChecks.delete(collection)
      check = undefined
    }
    if (!check) {
      check = startIntegrityCheck(event, collection, config)
      integrityChecks.set(collection, check)
    }

    if (await settlesBeforeStalling(check)) {
      if (await check.promise) {
        return
      }
      break
    }

    // The request that owns this check is gone: forget it, a new check takes over.
    // A zombie check which settles later can no longer alter the shared state, and its lease expires.
    if (integrityChecks.get(collection) === check) {
      integrityChecks.delete(collection)
    }
    console.warn(`Database integrity check of "${collection}" stalled, starting a new one`)
  }

  throw createError({ statusCode: 503, statusMessage: `Content of "${collection}" is not available yet, try again later` })
}

/**
 * Starts the check of a collection, to be shared by the requests of the isolate.
 * Its promise never rejects: it resolves `false` and records `failedAt` when the check failed.
 * @param event - Request that starts the check, whose `waitUntil` keeps it running
 * @param collection - Collection name
 * @param config - Content runtime config
 */
function startIntegrityCheck(event: H3Event, collection: string, config: RuntimeConfig['content']): IntegrityCheck {
  const check: IntegrityCheck = { promise: Promise.resolve(false), lastProgress: Date.now(), token: createToken() }

  check.promise = _checkAndImportDatabaseIntegrity(event, collection, checksums[collection]!, checksumsStructure[collection]!, config, check)
    .then((isValid) => {
      if (!isValid) {
        throw new Error(`Collection "${collection}" is not ready after its import`)
      }
      return true
    })
    .catch((error) => {
      console.error('Database integrity check failed', error)
      // fail fast for a while, then let a new request try again
      check.failedAt = Date.now()
      return false
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

/**
 * Checks the collection, and imports its dump under the import lease when it is not ready.
 * @param event - Request used to fetch the dump
 * @param collection - Collection name
 * @param integrityVersion - Version of the bundled dump
 * @param structureIntegrityVersion - Version of the table structure of the bundled dump
 * @param config - Content runtime config
 * @param check - Shared check, whose progress and lease token are used
 * @returns `true` once the collection is ready with the bundled version
 */
async function _checkAndImportDatabaseIntegrity(event: H3Event, collection: string, integrityVersion: string, structureIntegrityVersion: string, config: RuntimeConfig['content'], check: IntegrityCheck) {
  const adapter = await loadDatabaseAdapter(config)
  /** Records that the check is alive */
  const progress = () => {
    check.lastProgress = Date.now()
  }
  // every completed database call proves that the request which runs the check is still alive
  const db: DatabaseAdapter = {
    all: (sql, params) => adapter.all(sql, params).finally(progress) as never,
    first: (sql, params) => adapter.first(sql, params).finally(progress) as never,
    exec: (sql, params) => adapter.exec(sql, params).finally(progress),
  }

  /** Reads the info row of the collection, `null` when it (or the info table) does not exist */
  const readChecksum = () => db.first<InfoRow>(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch((): null => null)
  /** Whether the info row says the bundled version is imported and ready */
  const isReady = (row: InfoRow | null | undefined) => !!row?.ready && row.version === integrityVersion

  if (isReady(await readChecksum())) {
    // table is already initialized and ready, use it
    return true
  }

  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump)
  progress()
  if (!dump.length) {
    // never replace a collection with nothing: the import would delete every record
    throw new Error(`Database dump of "${collection}" is empty`)
  }
  const lines = dump.map(splitDumpLine)

  await ensureInfoTable(db, lines[0])

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
    const before = await readChecksum()
    if (isReady(before)) {
      return true
    }

    // A row that is not ready comes from an import that never finished, and a row of another database version
    // may come with another table layout: in both cases, the table cannot be trusted and is rebuilt.
    const unchangedStructure = !!before?.ready
      && String(before.version).startsWith(`${config.databaseVersion}--`)
      && before.structureVersion === structureIntegrityVersion

    await importCollection(db, collection, lines, unchangedStructure, lease)
  }
  finally {
    await lease.release()
  }

  return isReady(await readChecksum())
}

/**
 * Creates the info table, which holds the leases, from the first line of the dump.
 * A table left by an older version of the module with other columns is replaced.
 */
async function ensureInfoTable(db: DatabaseAdapter, definition: DumpLine | undefined) {
  if (definition?.hash !== 'structure' || !definition.statement.includes(` ${tables.info} `)) {
    return
  }
  await db.exec(definition.statement).catch(() => {})

  const columns = [...definition.statement.matchAll(/"(\w+)"/g)].map(match => `"${match[1]}"`)
  /** Whether the info table has every column of its definition */
  const probe = () => db.first(`SELECT id, ${columns.join(', ')} FROM ${tables.info} LIMIT 1`).then(() => true, () => false)
  // probe twice, so that a transient error does not reset the info table of every collection
  if (await probe() || await probe()) {
    return
  }
  console.warn(`Database table ${tables.info} has an outdated structure, recreating it`)
  await db.exec(`DROP TABLE IF EXISTS ${tables.info}`)
  await db.exec(definition.statement)
}

/**
 * Imports the dump of a collection, by the owner of its lease, and flags it as ready.
 * With an unchanged structure, only the records that changed are deleted and inserted;
 * otherwise the table is rebuilt.
 * @param db - Database adapter
 * @param collection - Collection name
 * @param lines - Lines of the dump
 * @param unchangedStructure - Whether the existing table can be updated in place
 * @param lease - Import lease, held by the caller
 * @throws When a statement keeps failing, the records do not match the dump, or the lease is lost
 */
async function importCollection(db: DatabaseAdapter, collection: string, lines: DumpLine[], unchangedStructure: boolean, lease: Lease) {
  const table = tables[collection]

  // Delete old version -- checksum exists but does not match with bundled checksum (or its import never finished)
  await lease.renew()
  await db.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`])

  // records of the dump, by hash (a large record spans several lines that share its hash)
  const dumpHashes = new Set(lines.map(line => line.hash).filter(hash => hash !== 'structure' && hash !== 'meta'))
  let hashesInDb = new Set<string>()

  if (unchangedStructure) {
    // get the list of hash in the database
    const hashesInDbRecords = await db.all<{ __hash__: string }>(`SELECT __hash__ FROM ${table}`)
    hashesInDb = new Set(hashesInDbRecords.map(r => r.__hash__))

    // delete the records which are not in the dump anymore
    const hashesToDelete = [...hashesInDb].filter(hash => !dumpHashes.has(hash))
    for (let i = 0; i < hashesToDelete.length; i += MAX_BOUND_PARAMETERS) {
      const chunk = hashesToDelete.slice(i, i + MAX_BOUND_PARAMETERS)
      await lease.renew()
      await execStatement(db, `DELETE FROM ${table} WHERE __hash__ IN (${chunk.map(() => '?').join(',')})`, chunk, lease)
    }
  }
  else {
    // we need to drop the table and recreate it
    await lease.renew()
    await db.exec(`DROP TABLE IF EXISTS ${table}`)
  }

  for (const [index, { statement, hash }] of lines.entries()) {
    // the dump ends by flagging the collection as ready: done below, only by the owner of the lease
    if (index === lines.length - 1 && hash === 'meta' && /\bSET ready = true\b/i.test(statement)) {
      continue
    }

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

    // Structure changes must come from the owner of the lease,
    // other lines only need the lease to be extended regularly
    await lease.renew(hash !== 'structure')

    // a structure line may hold several statements (DROP, CREATE, indexes) which not every database runs at once
    for (const sql of hash === 'structure' ? splitStatements(statement) : [statement]) {
      await execStatement(db, sql, undefined, lease)
    }
  }

  // flag the collection as ready, only once it holds exactly the records of the dump
  await verifyRecords(db, collection, dumpHashes)
  await lease.renew()
  await lease.flagReady(`checksum_${collection}`)
}

/**
 * Checks that the table holds exactly the records of the dump, by their hash.
 * @param db - Database adapter
 * @param collection - Collection name
 * @param dumpHashes - Hashes of the records of the dump
 * @throws When records are missing, unexpected or duplicated
 */
async function verifyRecords(db: DatabaseAdapter, collection: string, dumpHashes: Set<string>) {
  const records = await db.all<{ __hash__: string }>(`SELECT __hash__ FROM ${tables[collection]}`)
  const hashes = new Set(records.map(r => r.__hash__))
  // (no `Set.prototype.difference`, it is not available on Node.js 20)
  const missing = [...dumpHashes].filter(hash => !hashes.has(hash)).length
  const unexpected = [...hashes].filter(hash => !dumpHashes.has(hash)).length
  if (missing || unexpected || records.length !== hashes.size) {
    throw new Error(`Import of "${collection}" is incomplete: ${missing} missing and ${unexpected} unexpected records`)
  }
}

/**
 * Runs a statement of the import, retrying it `STATEMENT_ATTEMPTS` times to ride out transient errors.
 * @param db - Database adapter
 * @param sql - SQL statement
 * @param params - Bound parameters
 * @param lease - Import lease, confirmed before each retry: a statement that failed after a long wait
 * must not be retried once another request has taken the import over
 * @throws The last error, once every attempt failed, or when the lease was lost
 */
async function execStatement(db: DatabaseAdapter, sql: string, params?: Parameters<DatabaseAdapter['exec']>[1], lease?: Lease) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.exec(sql, params)
    }
    catch (error) {
      if (attempt >= STATEMENT_ATTEMPTS) {
        throw new Error(`Failed to execute SQL ${sql.slice(0, 200)}: ${(error as Error)?.message || 'Unknown error'}`, { cause: error })
      }
      await new Promise(resolve => setTimeout(resolve, 200 * attempt))
      await lease?.renew()
    }
  }
}

interface DumpLine {
  statement: string
  hash: string
}

/**
 * In D1, there is a bug where semicolons and comments can't work together
 * so we need to split the SQL and remove the comment
 * @see https://github.com/cloudflare/workers-sdk/issues/3892
 */
function splitDumpLine(sql: string): DumpLine {
  const hash = sql.split(' -- ').pop()!
  return { statement: sql.substring(0, sql.length - hash.length - 4), hash }
}

/**
 * Splits SQL on the semicolons that end statements, ignoring those in quoted strings and identifiers
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let quote: string | undefined
  let start = 0
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    if (quote) {
      if (char === quote) quote = undefined
    }
    else if (char === '\'' || char === '"' || char === '`') {
      quote = char
    }
    else if (char === ';') {
      statements.push(sql.slice(start, i + 1))
      start = i + 1
    }
  }
  statements.push(sql.slice(start))
  return statements.map(statement => statement.trim()).filter(statement => statement && statement !== ';')
}

interface Lease {
  /**
   * Takes the lease when it is free or expired.
   * @returns `true` when the lease was taken
   */
  acquire: () => Promise<boolean>
  /**
   * Makes sure the lease is still held, and extends it.
   * With `lazy`, only does so when it was not done for `LEASE_RENEW_INTERVAL`.
   */
  renew: (lazy?: boolean) => Promise<void>
  /**
   * Sets `ready` on a row of the info table, in the same statement that checks the lease is still held:
   * an owner that lost its lease right before cannot flag the import that replaced it
   */
  flagReady: (id: string) => Promise<void>
  /**
   * Gives the lease up, if it is still held
   */
  release: () => Promise<void>
}

/**
 * Creates the import lease of a collection, stored as the `lease_<collection>` row of the info table.
 * @param db - Database adapter
 * @param collection - Collection name
 * @param token - Owner token, unique to the check that uses the lease
 */
function createLease(db: DatabaseAdapter, collection: string, token: string): Lease {
  const id = `lease_${collection}`
  /** Timestamp `offset` ms from now, fixed width so that timestamps compare as strings on every database */
  const expiry = (offset: number) => String(Date.now() + offset).padStart(16, '0')
  let renewedAt = 0

  return {
    /** See {@link Lease.acquire} */
    async acquire() {
      await db.exec(`DELETE FROM ${tables.info} WHERE id = ? AND "structureVersion" < ?`, [id, expiry(0)]).catch(() => {})
      const acquired = await db.exec(`INSERT INTO ${tables.info} (id, ready, "structureVersion", version) VALUES (?, false, ?, ?)`, [id, expiry(LEASE_TTL), token])
        .then(() => true, () => false)
      if (acquired) {
        renewedAt = Date.now()
      }
      return acquired
    },
    /** See {@link Lease.renew} */
    async renew(lazy = false) {
      if (lazy && Date.now() - renewedAt < LEASE_RENEW_INTERVAL) {
        return
      }
      await db.exec(`UPDATE ${tables.info} SET "structureVersion" = ? WHERE id = ? AND version = ?`, [expiry(LEASE_TTL), id, token])
      const row = await db.first<{ version: string }>(`SELECT version FROM ${tables.info} WHERE id = ?`, [id])
      if (row?.version !== token) {
        throw new Error(`Lost the import lease of "${collection}" to another request`)
      }
      renewedAt = Date.now()
    },
    /** See {@link Lease.flagReady} */
    async flagReady(rowId: string) {
      await execStatement(db, `UPDATE ${tables.info} SET ready = true WHERE id = ? AND EXISTS (SELECT 1 FROM ${tables.info} WHERE id = ? AND version = ?)`, [rowId, id, token])
      const row = await db.first<{ ready: boolean }>(`SELECT ready FROM ${tables.info} WHERE id = ?`, [rowId])
      if (!row?.ready) {
        throw new Error(`Lost the import lease of "${collection}" to another request`)
      }
    },
    /** See {@link Lease.release} */
    async release() {
      await db.exec(`DELETE FROM ${tables.info} WHERE id = ? AND version = ?`, [id, token]).catch(() => {})
    },
  }
}

/**
 * Creates a unique owner token for an import lease
 */
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
