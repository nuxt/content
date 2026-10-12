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

const STRUCTURE = 'structure-1'
const ITEMS = 10
// same definition as `generateCollectionTableDefinition(infoCollection)`
const INFO_TABLE = 'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE)'

interface Release {
  version: string
  /** record ids, the hash of a record is `h<id>` */
  records: number[]
  /** a dump that does not follow the release, e.g. an empty one */
  dump?: string[]
}

const V1: Release = { version: 'v1--abc', records: Array.from({ length: ITEMS }, (_, i) => i) }

interface Engine {
  name: string
  create: () => Connector
  /** D1 runs a statement holding several SQL commands, the other drivers reject it */
  multiStatement?: boolean
}

const engines: Engine[] = [
  { name: 'sqlite (D1 dialect)', create: () => betterSqlite3({ name: ':memory:' }), multiStatement: true },
  { name: 'libsql', create: () => libsql({ url: ':memory:' }) },
  { name: 'postgresql (pglite)', create: () => pglite({}) },
]

/** The dump has the same shape as the one generated in `src/module.ts` */
function buildDump(release: Release): string[] {
  return [
    `${INFO_TABLE}; -- structure`,
    `INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', '${release.version}', 'info-hash'); -- meta`,
    // like `generateCollectionTableDefinition(collection, { drop: true })`: several statements in one line
    'DROP TABLE IF EXISTS _content_test;\nCREATE TABLE IF NOT EXISTS _content_test (id TEXT PRIMARY KEY, title TEXT DEFAULT \'a;b\', __hash__ TEXT UNIQUE);\nCREATE INDEX IF NOT EXISTS idx_test_title ON _content_test ("title"); -- structure',
    ...release.records.map(i => `INSERT INTO _content_test VALUES ('${i}', 'Title ${i}; with a semicolon', 'h${i}'); -- h${i}`),
    'UPDATE _content_info SET ready = true WHERE id = \'checksum_test\'; -- meta',
  ]
}

type Interceptor = (sql: string, params: unknown[]) => Promise<void> | void

/**
 * Wraps the database shared by every simulated Worker isolate. `interceptor` lets a test hang
 * or fail individual statements, simulating a request cancelled by the runtime or a flaky database.
 */
function intercept(connector: Connector, interceptor: Interceptor = () => {}, multiStatement = false): Connector {
  return {
    ...connector,
    prepare: (sql: string) => {
      const statement = connector.prepare(sql)
      return {
        all: async (...params: unknown[]) => {
          await interceptor(sql, params)
          return statement.all(...params)
        },
        get: async (...params: unknown[]) => {
          await interceptor(sql, params)
          return statement.get(...params)
        },
        run: async (...params: unknown[]) => {
          await interceptor(sql, params)
          return multiStatement && !params.length && /;\s*\S/.test(sql) ? connector.exec(sql) : statement.run(...params)
        },
      }
    },
  } as Connector
}

/** A promise that never settles: a call whose request was cancelled */
const never = () => new Promise<void>(() => {})

/** A promise settled from the outside, to pause and resume a call */
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

/** Resolves to the outcome of the promise once `ms` of fake time have passed */
async function outcomeWithin(promise: Promise<unknown>, ms: number) {
  let outcome: 'pending' | 'resolved' | number = 'pending'
  void promise.then(() => (outcome = 'resolved'), (error: { statusCode?: number }) => (outcome = error?.statusCode || 0))
  await vi.advanceTimersByTimeAsync(ms)
  return outcome
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

/** Records the record inserts of the import */
function countInserts() {
  const inserts: string[] = []
  const interceptor: Interceptor = (sql) => {
    if (sql.startsWith('INSERT INTO _content_test')) inserts.push(sql)
  }
  return { inserts, interceptor }
}

type IntegrityModule = typeof import('../../src/runtime/internal/database.server')

// Node.js 20 (supported by `engines`) has none of the Set methods added in ES2025
const ES2025_SET_METHODS = ['difference', 'intersection', 'union', 'symmetricDifference', 'isSubsetOf', 'isSupersetOf', 'isDisjointFrom'] as const
const setMethods = new Map(ES2025_SET_METHODS.map(name => [name, Object.getOwnPropertyDescriptor(Set.prototype, name)]))
beforeAll(() => {
  for (const name of ES2025_SET_METHODS) Reflect.deleteProperty(Set.prototype, name)
})
afterAll(() => {
  for (const [name, descriptor] of setMethods) {
    if (descriptor) Object.defineProperty(Set.prototype, name, descriptor)
  }
})

describe.each(engines)('database.server - lazy import ($name)', (engine) => {
  let db: Connector

  /** Loads a fresh copy of the module: the equivalent of a new Worker isolate */
  async function loadIsolate(interceptor?: Interceptor, release: Release = V1, databaseVersion = 'v1') {
    vi.resetModules()
    vi.doMock('#content/adapter', () => ({ default: () => intercept(db, interceptor, engine.multiStatement) }))
    vi.doMock('#content/local-adapter', () => ({ default: () => intercept(db, interceptor, engine.multiStatement) }))
    vi.doMock('#content/manifest', () => ({
      tables: { test: '_content_test', info: '_content_info' },
      checksums: { test: release.version },
      checksumsStructure: { test: STRUCTURE },
      default: { info: { fields: {} }, test: { fields: { id: 'string', title: 'string' } } },
    }))
    vi.doMock('../../src/runtime/internal/api', () => ({ fetchDatabase: async () => 'dump' }))
    vi.doMock('../../src/runtime/internal/dump', () => ({ decompressSQLDump: async () => release.dump || buildDump(release) }))
    const mod: IntegrityModule = await import('../../src/runtime/internal/database.server')
    return (event: object = {}) => mod.checkAndImportDatabaseIntegrity(event as never, 'test', { ...config, databaseVersion })
  }

  /** Runs a statement on the shared database, outside of any isolate */
  const run = (sql: string) => db.prepare(sql).run()

  /** Reads the info row and the records of the collection */
  async function readState() {
    const row = await db.prepare('SELECT * FROM _content_info WHERE id = ?').get('checksum_test') as { ready: number | boolean, version: string } | undefined
    const ids = await db.prepare('SELECT id FROM _content_test ORDER BY id').all()
      .then(rows => (rows as { id: string }[]).map(r => Number(r.id)).sort((a, b) => a - b), () => [] as number[])
    return { row, ready: Boolean(row?.ready), items: ids.length, ids }
  }

  /** The collection is ready only with exactly the records of the release */
  async function expectImported(release: Release = V1) {
    const { row, ready, ids } = await readState()
    expect(ready).toBe(true)
    expect(row?.version).toBe(release.version)
    expect(ids).toEqual([...release.records].sort((a, b) => a - b))
  }

  /** Lease expiry `offset` ms from now, in the format of the lease row */
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

  describe('imports', () => {
    test('a normal import publishes every row and flips ready', async () => {
      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
    })

    test('an upgrade with the same structure applies the content changes in place', async () => {
      await loadIsolate().then(check => outcomeWithin(check(), 5000))
      // 150 records removed (more than D1 accepts as bound parameters in one statement), 3 kept, 5 added
      const big: Release = { version: 'v1--big', records: Array.from({ length: 153 }, (_, i) => i) }
      await loadIsolate(undefined, big).then(check => outcomeWithin(check(), 10_000))
      await expectImported(big)

      const v2: Release = { version: 'v1--two', records: [0, 1, 2, 200, 201, 202, 203, 204] }
      const { inserts, interceptor } = countInserts()
      const d1Limits: Interceptor = (sql, params) => {
        if (params.length > 100) throw new Error('too many SQL variables')
        return interceptor(sql, params)
      }
      const check = await loadIsolate(d1Limits, v2)
      expect(await outcomeWithin(check(), 10_000)).toBe('resolved')
      await expectImported(v2)
      // unchanged records are kept, not inserted again
      expect(inserts).toHaveLength(5)
    })

    test('a new database version rebuilds the collection without touching other collections', async () => {
      await run(INFO_TABLE)
      await run(`INSERT INTO _content_info VALUES ('checksum_test', true, '${STRUCTURE}', 'v0--old', NULL)`)
      // another collection is being imported at the same time
      await run(`INSERT INTO _content_info (id, ready, "structureVersion", version) VALUES ('lease_other', false, '${leaseExpiry(60_000)}', 'other-isolate')`)

      const check = await loadIsolate(undefined, { ...V1, version: 'v1--abc' })
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
      expect(await db.prepare('SELECT version FROM _content_info WHERE id = ?').get('lease_other')).toMatchObject({ version: 'other-isolate' })
    })

    test('an info table with an outdated structure is recreated', async () => {
      // e.g. created by a version of the module without the `__hash__` column
      await run('CREATE TABLE _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR)')
      await run(`INSERT INTO _content_info VALUES ('checksum_test', true, '${STRUCTURE}', 'v0--old')`)

      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
    })

    test('concurrent callers in one isolate share a single import', async () => {
      const { inserts, interceptor } = countInserts()
      const check = await loadIsolate(interceptor)
      expect(await settlesWithin(Promise.all([check(), check(), check()]), 5000)).toBe(true)

      expect(inserts).toHaveLength(ITEMS)
      await expectImported()
    })

    test('isolates racing on a fresh database import the collection once', async () => {
      const { inserts, interceptor } = countInserts()
      const isolates = [await loadIsolate(interceptor), await loadIsolate(interceptor), await loadIsolate(interceptor)]
      expect(await settlesWithin(Promise.all(isolates.map(check => check())), 10_000)).toBe(true)

      expect(inserts).toHaveLength(ITEMS)
      await expectImported()
    })

    test('isolates racing on a new version import the collection once', async () => {
      await run(INFO_TABLE)
      await run(`INSERT INTO _content_info VALUES ('checksum_test', true, 'structure-0', 'v1--old', NULL)`)
      const { inserts, interceptor } = countInserts()
      const isolates = [await loadIsolate(interceptor), await loadIsolate(interceptor)]
      expect(await settlesWithin(Promise.all(isolates.map(check => check())), 10_000)).toBe(true)

      expect(inserts).toHaveLength(ITEMS)
      await expectImported()
    })

    test('a request waits for an import running elsewhere, without importing again', async () => {
      // Another isolate is actively importing: `ready = 0` now, `ready = 1` shortly after
      await run(INFO_TABLE)
      await run(`INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', '${V1.version}', NULL)`)
      // ...and holds a live lease
      await run(`INSERT INTO _content_info (id, ready, "structureVersion", version) VALUES ('lease_test', false, '${leaseExpiry(60_000)}', 'other-isolate')`)

      const { inserts, interceptor } = countInserts()
      const check = await loadIsolate(interceptor)
      const done = check()
      await vi.advanceTimersByTimeAsync(3000)
      await run('UPDATE _content_info SET ready = true WHERE id = \'checksum_test\'')
      expect(await outcomeWithin(done, 3000)).toBe('resolved')

      expect(inserts).toHaveLength(0)
    })

    test('the lease is released once the import is done', async () => {
      const check = await loadIsolate()
      await outcomeWithin(check(), 5000)
      expect(await db.prepare('SELECT * FROM _content_info WHERE id = ?').get('lease_test')).toBeFalsy()
    })

    test('the check is handed to `waitUntil` so a client disconnect does not cancel it', async () => {
      const waitUntil = vi.fn()
      const check = await loadIsolate()
      expect(await outcomeWithin(check({ waitUntil }), 5000)).toBe('resolved')
      expect(waitUntil).toHaveBeenCalledOnce()
      expect(waitUntil.mock.calls[0]![0]).toBeInstanceOf(Promise)

      // Nitro sub-requests only expose the platform `waitUntil` on the context
      const contextWaitUntil = vi.fn()
      const otherIsolate = await loadIsolate()
      await outcomeWithin(otherIsolate({ context: { waitUntil: contextWaitUntil } }), 5000)
      expect(contextWaitUntil).toHaveBeenCalledOnce()
    })
  })

  describe('interrupted imports', () => {
    test('failure 1: a later isolate recovers from a `ready = 0` row left by a killed import', async () => {
      // Isolate A is cut off after 4 rows are written: `ready = 0` stays in the database
      const killedCheck = await loadIsolate(killAfterInserts(4))
      void killedCheck().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)

      const state = await readState()
      expect(state.ready).toBe(false)
      expect(state.items).toBe(4)

      // Isolate B starts later, with nothing wrong on its side
      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 5 * 60 * 1000)).toBe('resolved')
      await expectImported()
    })

    test('a fresh isolate takes over a dead import within the lease lifetime, not after the 90s wait', async () => {
      const killedCheck = await loadIsolate(killAfterInserts(4))
      void killedCheck().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)

      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 40_000)).toBe('resolved')
      await expectImported()
    })

    test('failure 1: a stale `ready = 0` row from an older version never reuses a half-built table', async () => {
      // an older version got stuck right after writing its info row: the collection table was never created
      await run(INFO_TABLE)
      await run(`INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', 'v1--old', NULL)`)

      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 5 * 60 * 1000)).toBe('resolved')
      await expectImported()
    })

    test('failure 2: a promise that never settles does not block later callers in the same isolate', async () => {
      // The first request is cancelled while it holds the memoised check: its database call never settles
      let hang = true
      const check = await loadIsolate((sql) => {
        if (hang && sql.startsWith('INSERT INTO _content_test')) return never()
      })
      void check().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)
      hang = false // the runtime is healthy again for later requests

      expect(await outcomeWithin(check(), 5 * 60 * 1000)).toBe('resolved')
      await expectImported()
    })

    test('failure 2: a check that never settles before any write does not block later callers either', async () => {
      // the cancelled request hangs on the very first query (e.g. reading `_content_info`)
      let hang = true
      const check = await loadIsolate((sql) => {
        if (hang && sql.startsWith('SELECT * FROM _content_info')) return never()
      })
      void check().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)
      hang = false

      expect(await outcomeWithin(check(), 5 * 60 * 1000)).toBe('resolved')
      await expectImported()
    })

    test('an import that lost its lease mid-way never flags the collection as ready', async () => {
      // isolate A is paused (not dead) in the middle of its import
      const pause = deferred()
      let inserts = 0
      let frozen = false
      const checkA = await loadIsolate((sql) => {
        // nothing else runs in A's isolate while it is paused (its request is gone)
        if (frozen) return never()
        if (sql.startsWith('INSERT INTO _content_test') && ++inserts === 5) {
          frozen = true
          return pause.promise.then(() => (frozen = false, undefined))
        }
      })
      void checkA().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)
      expect(frozen).toBe(true)

      // isolate B takes over once A's lease has expired, and completes
      const checkB = await loadIsolate()
      expect(await outcomeWithin(checkB(), 40_000)).toBe('resolved')

      // A wakes up: the statement it had in flight fails on the complete table, and its import stops there
      vi.mocked(console.error).mockClear()
      pause.release()
      await vi.advanceTimersByTimeAsync(15_000)
      expect(console.error).toHaveBeenCalledWith('Database integrity check failed', expect.any(Error))
      await expectImported()
    })

    test('an import paused before its first write cannot damage the import that replaced it', async () => {
      // isolate A acquires the lease, then is paused right before it starts writing
      const pauseA = deferred()
      let reads = 0
      let frozen = false
      const checkA = await loadIsolate((sql) => {
        // nothing else runs in A's isolate while it is paused (its request is gone)
        if (frozen) return never()
        // the second read of the checksum row happens once the lease is held
        if (sql === 'SELECT * FROM _content_info WHERE id = ?' && ++reads === 2) {
          frozen = true
          return pauseA.promise.then(() => (frozen = false, undefined))
        }
      })
      void checkA().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)
      expect(reads).toBe(2)

      // isolate B takes the lease over once it has expired, and is half-way through its own import
      const pauseB = deferred()
      let inserts = 0
      const checkB = await loadIsolate((sql) => {
        if (sql.startsWith('INSERT INTO _content_test') && ++inserts === 4) return pauseB.promise
      })
      const doneB = checkB()
      await vi.advanceTimersByTimeAsync(40_000)
      expect(inserts).toBe(4)
      expect((await readState()).items).toBe(3)

      // A wakes up: it must stop before deleting the checksum row or dropping the table B is filling
      vi.mocked(console.error).mockClear()
      pauseA.release()
      await vi.advanceTimersByTimeAsync(1000)
      expect(console.error).toHaveBeenCalledWith('Database integrity check failed', expect.objectContaining({ message: expect.stringContaining('Lost the import lease') }))
      expect((await readState()).items).toBe(3)

      // B completes its import, untouched
      pauseB.release()
      expect(await outcomeWithin(doneB, 10_000)).toBe('resolved')
      await expectImported()
    })
  })

  describe('failures', () => {
    test('an empty dump never replaces the collection', async () => {
      await loadIsolate().then(check => outcomeWithin(check(), 5000))
      await expectImported()

      const check = await loadIsolate(undefined, { version: 'v1--empty', records: [], dump: [] })
      expect(await outcomeWithin(check(), 5000)).toBe(503)
      // the previous release is untouched
      await expectImported()
    })

    test('an owner that lost its lease right before flagging the collection cannot flag the import that replaced it', async () => {
      // isolate A has imported every record, and is paused right before it flags the collection as ready
      const pauseA = deferred()
      let frozen = false
      const checkA = await loadIsolate((sql) => {
        if (frozen) return never()
        if (sql.startsWith('UPDATE _content_info SET ready = true')) {
          frozen = true
          return pauseA.promise.then(() => (frozen = false, undefined))
        }
      })
      void checkA().catch(() => {})
      await vi.advanceTimersByTimeAsync(1000)
      expect(frozen).toBe(true)

      // isolate B takes the lease over once it has expired, and is half-way through its own import
      const pauseB = deferred()
      let inserts = 0
      const checkB = await loadIsolate((sql) => {
        if (sql.startsWith('INSERT INTO _content_test') && ++inserts === 4) return pauseB.promise
      })
      const doneB = checkB()
      await vi.advanceTimersByTimeAsync(40_000)
      expect(inserts).toBe(4)

      // A's flag lands now: it must not flag B's half-done import as ready
      pauseA.release()
      await vi.advanceTimersByTimeAsync(1000)
      expect((await readState()).ready).toBe(false)
      expect((await readState()).items).toBe(3)

      pauseB.release()
      expect(await outcomeWithin(doneB, 10_000)).toBe('resolved')
      await expectImported()
    })

    test('a transient statement error is retried', async () => {
      let failures = 0
      const check = await loadIsolate((sql) => {
        if (sql.includes('\'5\'') && failures++ < 2) throw new Error('D1_ERROR: Network connection lost')
      })
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
    })

    test('a statement that keeps failing never flags an incomplete collection as ready', async () => {
      let broken = true
      const check = await loadIsolate((sql) => {
        if (broken && sql.includes('\'5\'')) throw new Error('D1_ERROR: Network connection lost')
      })
      // requests fail with a 503 instead of reading an incomplete collection
      expect(await outcomeWithin(check(), 5000)).toBe(503)
      expect((await readState()).ready).toBe(false)
      expect(await outcomeWithin(check(), 1000)).toBe(503)

      // once the database is healthy again, a later request completes the import
      broken = false
      await vi.advanceTimersByTimeAsync(11_000)
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
    })

    test('rows lost during the import are detected before the collection is flagged as ready', async () => {
      // something removes a record behind the back of the import (e.g. a stray statement of a dead import)
      let sabotage = true
      const check = await loadIsolate(async (sql) => {
        if (sabotage && sql.startsWith('INSERT INTO _content_test') && sql.includes('\'9\'')) {
          sabotage = false
          await run('DELETE FROM _content_test WHERE id = \'0\'')
        }
      })
      expect(await outcomeWithin(check(), 5000)).toBe(503)
      expect((await readState()).ready).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Database integrity check failed', expect.objectContaining({ message: expect.stringContaining('1 missing') }))

      await vi.advanceTimersByTimeAsync(11_000)
      expect(await outcomeWithin(check(), 5000)).toBe('resolved')
      await expectImported()
    })

    test('a request does not wait forever for an import that never ends', async () => {
      await run(INFO_TABLE)
      await run(`INSERT INTO _content_info VALUES ('checksum_test', false, '${STRUCTURE}', '${V1.version}', NULL)`)
      // a live import keeps its lease alive for longer than a request can wait
      await run(`INSERT INTO _content_info (id, ready, "structureVersion", version) VALUES ('lease_test', false, '${leaseExpiry(10 * 60_000)}', 'other-isolate')`)

      const check = await loadIsolate()
      expect(await outcomeWithin(check(), 120_000)).toBe(503)
    })
  })
})
