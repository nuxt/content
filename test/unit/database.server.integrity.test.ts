import type { Connector } from 'db0'
import betterSqlite3 from 'db0/connectors/better-sqlite3'
import libsql from 'db0/connectors/libsql/node'
import pglite from 'db0/connectors/pglite'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { RuntimeConfig } from '@nuxt/content'

/**
 * Regression tests for lazy, per-request database imports (D1 and other remote databases).
 * See https://github.com/nuxt/content/issues/3854, https://github.com/nuxt/content/issues/3683
 * and https://github.com/nuxt/content/issues/3159
 *
 * The import runs inside whichever visitor request makes the first query after a
 * content change. If that request is cancelled, the import stops mid-way:
 * - the `_content_info` row is left at the current version with `ready = 0`
 * - the integrity promise memoised in the isolate never settles
 *
 * Every scenario runs on real db0 connectors, one per SQL dialect the import has to work with.
 * End-to-end tests on workerd + D1 live in `test/cloudflare-d1.test.ts`.
 */

const config = {
  database: { type: 'd1', bindingName: 'DB' },
  localDatabase: { type: 'sqlite', filename: ':memory:' },
  databaseVersion: 'v1',
} as unknown as RuntimeConfig['content']

const VERSION = 'v1--abc'
const STRUCTURE = 'structure-1'
const ITEMS = 10
// same definition as `generateCollectionTableDefinition(infoCollection)`
const INFO_TABLE = 'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE)'

interface Engine {
  name: string
  create: () => Connector
  /** whether a single statement may hold several SQL commands (D1 and SQLite do) */
  multiStatement: boolean
}

const engines: Engine[] = [
  { name: 'sqlite (D1 dialect)', create: () => betterSqlite3({ name: ':memory:' }), multiStatement: true },
  { name: 'libsql', create: () => libsql({ url: ':memory:' }), multiStatement: false },
  { name: 'postgresql (pglite)', create: () => pglite({}), multiStatement: false },
]

/** The dump has the same shape as the one generated in `src/module.ts` */
function buildDump(engine: Engine): string[] {
  const table = engine.multiStatement
    ? ['DROP TABLE IF EXISTS _content_test;\nCREATE TABLE IF NOT EXISTS _content_test (id TEXT PRIMARY KEY, title TEXT, __hash__ TEXT UNIQUE); -- structure']
    : ['DROP TABLE IF EXISTS _content_test; -- structure', 'CREATE TABLE IF NOT EXISTS _content_test (id TEXT PRIMARY KEY, title TEXT, __hash__ TEXT UNIQUE); -- structure']
  return [
    `${INFO_TABLE}; -- structure`,
    `INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', '${VERSION}', 'info-hash'); -- meta`,
    ...table,
    ...Array.from({ length: ITEMS }, (_, i) => `INSERT INTO _content_test VALUES ('${i}', 'Title ${i}', 'h${i}'); -- h${i}`),
    'UPDATE _content_info SET ready = true WHERE id = \'checksum_test\'; -- meta',
  ]
}

type Interceptor = (sql: string) => Promise<void> | void

/**
 * Wraps the database shared by every simulated Worker isolate.
 * `interceptor` lets a test hang individual statements, simulating a request cancelled by the runtime.
 */
function intercept(connector: Connector, interceptor: Interceptor = () => {}): Connector {
  return {
    ...connector,
    prepare: (sql: string) => {
      const statement = connector.prepare(sql)
      return {
        all: async (...params: unknown[]) => {
          await interceptor(sql)
          return statement.all(...params)
        },
        get: async (...params: unknown[]) => {
          await interceptor(sql)
          return statement.get(...params)
        },
        run: async (...params: unknown[]) => {
          await interceptor(sql)
          // like D1, accept several commands in one statement
          return sql.includes(';\n') && !params.length ? connector.exec(sql) : statement.run(...params)
        },
      }
    },
  } as Connector
}

const never = () => new Promise<void>(() => {})

function deferred() {
  let release!: () => void
  const promise = new Promise<void>(resolve => (release = resolve))
  return { promise, release }
}

/** Resolves to `true` if the promise settles within `ms` of fake time */
async function settlesWithin(promise: Promise<unknown>, ms: number) {
  let settled = false
  void promise.then(() => (settled = true), () => (settled = true))
  await vi.advanceTimersByTimeAsync(ms)
  return settled
}

/** Simulates an isolate that is killed after `count` rows: every call from then on never settles */
function killAfterInserts(count: number): Interceptor {
  let inserts = 0
  let dead = false
  return (sql) => {
    if (dead || (sql.startsWith('INSERT INTO _content_test') && ++inserts > count)) {
      dead = true
      return never()
    }
  }
}

function countInserts() {
  const inserts: string[] = []
  const interceptor: Interceptor = (sql) => {
    if (sql.startsWith('INSERT INTO _content_test')) inserts.push(sql)
  }
  return { inserts, interceptor }
}

type IntegrityModule = typeof import('../../src/runtime/internal/database.server')

describe.each(engines)('database.server - interrupted lazy import ($name)', (engine) => {
  let db: Connector

  /** Loads a fresh copy of the module: the equivalent of a new Worker isolate */
  async function loadIsolate(interceptor?: Interceptor) {
    vi.resetModules()
    vi.doMock('#content/adapter', () => ({ default: () => intercept(db, interceptor) }))
    vi.doMock('#content/local-adapter', () => ({ default: () => intercept(db, interceptor) }))
    vi.doMock('#content/manifest', () => ({
      tables: { test: '_content_test', info: '_content_info' },
      checksums: { test: VERSION },
      checksumsStructure: { test: STRUCTURE },
      default: { info: { fields: { ready: 'boolean' } }, test: { fields: { id: 'string', title: 'string' } } },
    }))
    vi.doMock('../../src/runtime/internal/api', () => ({ fetchDatabase: async () => 'dump' }))
    vi.doMock('../../src/runtime/internal/dump', () => ({ decompressSQLDump: async () => buildDump(engine) }))
    const mod: IntegrityModule = await import('../../src/runtime/internal/database.server')
    return (event: object = {}) => mod.checkAndImportDatabaseIntegrity(event as never, 'test', config)
  }

  const run = (sql: string) => db.prepare(sql).run()

  async function readState() {
    const row = await db.prepare('SELECT * FROM _content_info WHERE id = ?').get('checksum_test') as { ready: number | boolean, version: string } | undefined
    const items = await db.prepare('SELECT COUNT(*) AS c FROM _content_test').get()
      .then(r => Number((r as { c: number }).c), () => 0)
    return { row, ready: Boolean(row?.ready), items }
  }

  const leaseExpiry = (offset: number) => String(Date.now() + offset).padStart(16, '0')

  beforeAll(async () => {
    db = engine.create()
    // create the database before faking time: some drivers rely on timers to start
    await run('SELECT 1')
  })

  afterAll(async () => {
    await db.dispose?.()
  })

  beforeEach(async () => {
    await run('DROP TABLE IF EXISTS _content_info')
    await run('DROP TABLE IF EXISTS _content_test')
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'Date'] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  test('a normal import publishes every row and flips ready', async () => {
    const check = await loadIsolate()
    expect(await settlesWithin(check(), 5000)).toBe(true)

    const { ready, items } = await readState()
    expect(ready).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 1: a later isolate recovers from a `ready = 0` row left by a killed import', async () => {
    // Isolate A is cut off after 4 rows are written: `ready = 0` stays in the database
    const killedCheck = await loadIsolate(killAfterInserts(4))
    void killedCheck()
    await vi.advanceTimersByTimeAsync(1000)

    expect((await readState()).ready).toBe(false)
    expect((await readState()).items).toBe(4)

    // Isolate B starts later, with nothing wrong on its side
    const check = await loadIsolate()
    expect(await settlesWithin(check(), 5 * 60 * 1000)).toBe(true)

    const { ready, items } = await readState()
    expect(ready).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('a fresh isolate takes over a dead import within the lease lifetime, not after the 90s wait', async () => {
    const killedCheck = await loadIsolate(killAfterInserts(4))
    void killedCheck()
    await vi.advanceTimersByTimeAsync(1000)

    const check = await loadIsolate()
    expect(await settlesWithin(check(), 40_000)).toBe(true)
    const { ready, items } = await readState()
    expect(ready).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 1: a stale `ready = 0` row from an older version never reuses a half-built table', async () => {
    // an older version got stuck right after writing its info row: the collection table was never created
    await run(INFO_TABLE)
    await run(`INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', 'v1--old', NULL)`)

    const check = await loadIsolate()
    expect(await settlesWithin(check(), 5 * 60 * 1000)).toBe(true)

    const { row, ready, items } = await readState()
    expect(row?.version).toBe(VERSION)
    expect(ready).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 2: a promise that never settles does not block later callers in the same isolate', async () => {
    // The first request is cancelled while it holds the memoised check: its database call never settles
    let hang = true
    const check = await loadIsolate((sql) => {
      if (hang && sql.startsWith('INSERT INTO _content_test')) return never()
    })
    void check()
    await vi.advanceTimersByTimeAsync(1000)
    hang = false // the runtime is healthy again for later requests

    expect(await settlesWithin(check(), 5 * 60 * 1000)).toBe(true)
    const { ready, items } = await readState()
    expect(ready).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 2: a check that never settles before any write does not block later callers either', async () => {
    // the cancelled request hangs on the very first query (e.g. reading `_content_info`)
    let hang = true
    const check = await loadIsolate((sql) => {
      if (hang && sql.startsWith('SELECT * FROM _content_info')) return never()
    })
    void check()
    await vi.advanceTimersByTimeAsync(1000)
    hang = false

    expect(await settlesWithin(check(), 5 * 60 * 1000)).toBe(true)
    expect((await readState()).items).toBe(ITEMS)
  })

  test('concurrent callers in one isolate share a single import', async () => {
    const { inserts, interceptor } = countInserts()
    const check = await loadIsolate(interceptor)
    expect(await settlesWithin(Promise.all([check(), check(), check()]), 5000)).toBe(true)

    expect(inserts).toHaveLength(ITEMS)
    expect((await readState()).items).toBe(ITEMS)
  })

  test('isolates racing on a fresh database import the collection once', async () => {
    const { inserts, interceptor } = countInserts()
    const isolates = [await loadIsolate(interceptor), await loadIsolate(interceptor), await loadIsolate(interceptor)]
    expect(await settlesWithin(Promise.all(isolates.map(check => check())), 10_000)).toBe(true)

    expect(inserts).toHaveLength(ITEMS)
    expect((await readState()).items).toBe(ITEMS)
  })

  test('isolates racing on a new version import the collection once', async () => {
    await run(INFO_TABLE)
    await run(`INSERT INTO _content_info VALUES ('checksum_test', true, '${STRUCTURE}', 'v1--old', NULL)`)
    const { inserts, interceptor } = countInserts()
    const isolates = [await loadIsolate(interceptor), await loadIsolate(interceptor)]
    expect(await settlesWithin(Promise.all(isolates.map(check => check())), 10_000)).toBe(true)

    expect(inserts).toHaveLength(ITEMS)
    expect((await readState()).row?.version).toBe(VERSION)
  })

  test('a request waits for an import running elsewhere, without importing again', async () => {
    // Another isolate is actively importing: `ready = 0` now, `ready = 1` shortly after
    await run(INFO_TABLE)
    await run(`INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', '${VERSION}', NULL)`)
    // ...and holds a live lease
    await run(`INSERT INTO _content_info (id, ready, "structureVersion", version) VALUES ('lease_test', false, '${leaseExpiry(60_000)}', 'other-isolate')`)

    const { inserts, interceptor } = countInserts()
    const check = await loadIsolate(interceptor)
    const done = check()
    await vi.advanceTimersByTimeAsync(3000)
    await run('UPDATE _content_info SET ready = true WHERE id = \'checksum_test\'')
    expect(await settlesWithin(done, 3000)).toBe(true)

    expect(inserts).toHaveLength(0)
  })

  test('an import that lost its lease never flags the collection as ready', async () => {
    // isolate A is paused (not dead) in the middle of its import
    const pause = deferred()
    let inserts = 0
    const checkA = await loadIsolate((sql) => {
      if (sql.startsWith('INSERT INTO _content_test') && ++inserts === 5) return pause.promise
    })
    const doneA = checkA()
    await vi.advanceTimersByTimeAsync(1000)

    // isolate B takes over once A's lease has expired, and completes
    const checkB = await loadIsolate()
    expect(await settlesWithin(checkB(), 40_000)).toBe(true)

    // simulate B's work being lost, then A wakes up: it must not flag a collection it does not own
    await run('UPDATE _content_info SET ready = false WHERE id = \'checksum_test\'')
    pause.release()
    expect(await settlesWithin(doneA, 15_000)).toBe(true)

    expect((await readState()).ready).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Database integrity check failed', expect.objectContaining({ message: expect.stringContaining('Lost the import lease') }))
  })

  test('the lease is released once the import is done', async () => {
    const check = await loadIsolate()
    expect(await settlesWithin(check(), 5000)).toBe(true)
    expect(await db.prepare('SELECT * FROM _content_info WHERE id = ?').get('lease_test')).toBeFalsy()
  })

  test('the check is handed to `waitUntil` so a client disconnect does not cancel it', async () => {
    const waitUntil = vi.fn()
    const check = await loadIsolate()
    expect(await settlesWithin(check({ waitUntil }), 5000)).toBe(true)
    expect(waitUntil).toHaveBeenCalledOnce()
    expect(waitUntil.mock.calls[0]![0]).toBeInstanceOf(Promise)

    // Nitro sub-requests only expose the platform `waitUntil` on the context
    const contextWaitUntil = vi.fn()
    const otherIsolate = await loadIsolate()
    await settlesWithin(otherIsolate({ context: { waitUntil: contextWaitUntil } }), 5000)
    expect(contextWaitUntil).toHaveBeenCalledOnce()
  })
})
