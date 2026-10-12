import Database from 'better-sqlite3'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { RuntimeConfig } from '@nuxt/content'

/**
 * Regression tests for lazy, per-request database imports (D1 / remote databases).
 * See https://github.com/nuxt/content/issues/3854 and https://github.com/nuxt/content/issues/3683
 *
 * The import runs inside whichever visitor request makes the first query after a
 * content change. If that request is cancelled, the import stops mid-way:
 * - the `_content_info` row is left at the current version with `ready = 0`
 * - the integrity promise memoised in the isolate never settles
 */

const config = {
  database: { type: 'd1', bindingName: 'DB' },
  localDatabase: { type: 'sqlite', filename: ':memory:' },
  databaseVersion: 'v1',
} as unknown as RuntimeConfig['content']

const VERSION = 'v1--abc'
const STRUCTURE = 'structure-1'
const ITEMS = 10

/** The dump has the same shape as the one generated in `src/module.ts` */
function buildDump(): string[] {
  return [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, version TEXT, structureVersion TEXT, ready BOOLEAN); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_test', '${VERSION}', '${STRUCTURE}', false); -- meta`,
    'DROP TABLE IF EXISTS _content_test;\nCREATE TABLE IF NOT EXISTS _content_test (id TEXT PRIMARY KEY, title TEXT, __hash__ TEXT UNIQUE); -- structure',
    ...Array.from({ length: ITEMS }, (_, i) => `INSERT INTO _content_test VALUES ('${i}', 'Title ${i}', 'h${i}'); -- h${i}`),
    'UPDATE _content_info SET ready = true WHERE id = \'checksum_test\'; -- meta',
  ]
}

/**
 * A db0-shaped connector backed by an in-memory SQLite database that is shared by every
 * simulated Worker isolate. `interceptor` lets a test hang or fail individual statements,
 * simulating a request that is cancelled by the runtime.
 */
function createFakeD1(sqlite: Database.Database, interceptor: (sql: string) => Promise<void> | void = () => {}) {
  const exec = (sql: string) => sqlite.exec(sql)
  return {
    prepare: (sql: string) => ({
      all: async (...params: unknown[]) => {
        await interceptor(sql)
        return sqlite.prepare(sql).all(...params as never[])
      },
      get: async (...params: unknown[]) => {
        await interceptor(sql)
        return sqlite.prepare(sql).get(...params as never[])
      },
      run: async (...params: unknown[]) => {
        await interceptor(sql)
        return params.length ? sqlite.prepare(sql).run(...params as never[]) : exec(sql)
      },
    }),
  }
}

const never = () => new Promise<void>(() => {})

type IntegrityModule = typeof import('../../src/runtime/internal/database.server')

/** Loads a fresh copy of the module: the equivalent of a new Worker isolate */
async function loadIsolate(sqlite: Database.Database, interceptor?: (sql: string) => Promise<void> | void) {
  vi.resetModules()
  vi.doMock('#content/adapter', () => ({ default: () => createFakeD1(sqlite, interceptor) }))
  vi.doMock('#content/local-adapter', () => ({ default: () => createFakeD1(sqlite, interceptor) }))
  vi.doMock('#content/manifest', () => ({
    tables: { test: '_content_test', info: '_content_info' },
    checksums: { test: VERSION },
    checksumsStructure: { test: STRUCTURE },
    default: { info: { fields: { ready: 'boolean' } }, test: { fields: { id: 'string', title: 'string' } } },
  }))
  vi.doMock('../../src/runtime/internal/api', () => ({ fetchDatabase: async () => 'dump' }))
  vi.doMock('../../src/runtime/internal/dump', () => ({ decompressSQLDump: async () => buildDump() }))
  const mod: IntegrityModule = await import('../../src/runtime/internal/database.server')
  return (collection = 'test') => mod.checkAndImportDatabaseIntegrity({} as never, collection, config)
}

function readState(sqlite: Database.Database) {
  const row = sqlite.prepare('SELECT * FROM _content_info WHERE id = ?').get('checksum_test') as { ready: number | boolean, version: string } | undefined
  const count = () => {
    try {
      return (sqlite.prepare('SELECT COUNT(*) AS c FROM _content_test').get() as { c: number }).c
    }
    catch {
      return 0
    }
  }
  return { row, items: count() }
}

describe('database.server - interrupted lazy import', () => {
  let sqlite: Database.Database

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    sqlite = new Database(':memory:')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  test('a normal import publishes every row and flips ready', async () => {
    const check = await loadIsolate(sqlite)
    await check()

    const { row, items } = readState(sqlite)
    expect(Boolean(row?.ready)).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 1: a later isolate recovers from a `ready = 0` row left by a killed import', async () => {
    // Isolate A is cut off after 4 rows are written: `ready = 0` stays in the database
    let inserts = 0
    const killedCheck = await loadIsolate(sqlite, (sql) => {
      if (sql.startsWith('INSERT INTO _content_test') && ++inserts > 4) return never()
    })
    void killedCheck()
    await vi.advanceTimersByTimeAsync(1000)

    expect(Boolean(readState(sqlite).row?.ready)).toBe(false)
    expect(readState(sqlite).items).toBe(4)

    // Isolate B starts later, with nothing wrong on its side
    const check = await loadIsolate(sqlite)
    const done = check()
    let settled = false
    void done.then(() => (settled = true))
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    expect(settled).toBe(true)
    const { row, items } = readState(sqlite)
    expect(Boolean(row?.ready)).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 1: a stale `ready = 0` row from an older version never reuses a half-built table', async () => {
    // an older version got stuck right after writing its info row: the collection table was never created
    sqlite.exec('CREATE TABLE _content_info (id TEXT PRIMARY KEY, version TEXT, structureVersion TEXT, ready BOOLEAN)')
    sqlite.exec(`INSERT INTO _content_info VALUES ('checksum_test', 'v1--old', '${STRUCTURE}', false)`)

    const check = await loadIsolate(sqlite)
    const done = check()
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    await done

    const { row, items } = readState(sqlite)
    expect(row?.version).toBe(VERSION)
    expect(Boolean(row?.ready)).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 2: a promise that never settles does not block later callers in the same isolate', async () => {
    // The first request is cancelled while it holds the memoised check: its database call never settles
    let hang = true
    const check = await loadIsolate(sqlite, (sql) => {
      if (hang && sql.startsWith('INSERT INTO _content_test')) return never()
    })
    void check()
    await vi.advanceTimersByTimeAsync(1000)
    hang = false // the runtime is healthy again for later requests

    let settled = false
    const second = check().then(() => (settled = true))
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    expect(settled).toBe(true)
    await second
    const { row, items } = readState(sqlite)
    expect(Boolean(row?.ready)).toBe(true)
    expect(items).toBe(ITEMS)
  })

  test('failure 2: a check that never settles before any write does not block later callers either', async () => {
    // the cancelled request hangs on the very first query (e.g. reading `_content_info`)
    let hang = true
    const check = await loadIsolate(sqlite, (sql) => {
      if (hang && sql.startsWith('SELECT * FROM _content_info')) return never()
    })
    void check()
    await vi.advanceTimersByTimeAsync(1000)
    hang = false

    let settled = false
    void check().then(() => (settled = true))
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    expect(settled).toBe(true)
    expect(readState(sqlite).items).toBe(ITEMS)
  })

  test('concurrent callers in one isolate share a single import', async () => {
    const statements: string[] = []
    const check = await loadIsolate(sqlite, (sql) => {
      statements.push(sql)
    })
    await Promise.all([check(), check(), check()])

    expect(statements.filter(sql => sql.startsWith('INSERT INTO _content_test'))).toHaveLength(ITEMS)
    expect(readState(sqlite).items).toBe(ITEMS)
  })

  test('a request waits for an import running elsewhere, without importing again', async () => {
    // Another isolate is actively importing: `ready = 0` now, `ready = 1` shortly after
    sqlite.exec('CREATE TABLE _content_info (id TEXT PRIMARY KEY, version TEXT, structureVersion TEXT, ready BOOLEAN)')
    sqlite.exec(`INSERT INTO _content_info VALUES ('checksum_test', '${VERSION}', '${STRUCTURE}', false)`)

    const inserts: string[] = []
    const check = await loadIsolate(sqlite, (sql) => {
      if (sql.startsWith('INSERT INTO')) inserts.push(sql)
    })
    const done = check()
    await vi.advanceTimersByTimeAsync(3000)
    sqlite.exec('UPDATE _content_info SET ready = true')
    await vi.advanceTimersByTimeAsync(3000)
    await done

    expect(inserts).toHaveLength(0)
  })
})
