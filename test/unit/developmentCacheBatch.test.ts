// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Connector } from 'db0'
import betterSqlite3 from 'db0/connectors/better-sqlite3'
import nodeSqlite from 'db0/connectors/node-sqlite'
import sqlite3 from 'db0/connectors/sqlite3'
import { getLocalDatabase } from '../../src/utils/database'
import type { CacheEntry } from '../../src/types'

const cleanup: Array<() => Promise<void>> = []
afterEach(async () => {
  vi.restoreAllMocks()
  for (const close of cleanup.splice(0)) {
    await close()
  }
})

async function open(create: (options: { path: string }) => Connector, d1 = false) {
  const directory = await mkdtemp(join(tmpdir(), 'content-cache-batch-'))
  const filename = join(directory, 'cache.sqlite')
  const connector = create({ path: filename })
  const db = await getLocalDatabase(d1
    ? { type: 'd1', bindingName: directory }
    : { type: 'sqlite', filename }, { connector })
  cleanup.push(async () => {
    try {
      db.close()
    }
    finally {
      try {
        await connector.dispose?.()
      }
      finally {
        await rm(directory, { recursive: true, force: true })
      }
    }
  })
  return { db, connector }
}

const previous: CacheEntry = { id: 'content/page.md', value: '{"old":true}', checksum: 'old' }
const large: CacheEntry = {
  id: previous.id,
  value: JSON.stringify({ text: 'Unicode 雪😀, quotes \'" and slash \\'.repeat(6000) }),
  checksum: 'large',
}
const another: CacheEntry = { id: 'content/another.md', value: '{"new":true}', checksum: 'new' }

describe.each([
  ['better-sqlite3', betterSqlite3],
  ['node:sqlite', nodeSqlite],
  ['sqlite3', sqlite3],
] as const)('development cache batches: %s', (_name, create) => {
  test('replaces complete large values and commits the batch together', async () => {
    const { db, connector } = await open(create)
    await db.insertDevelopmentCache(previous.id, previous.value, previous.checksum)
    const exec = vi.spyOn(connector, 'exec')

    await db.insertDevelopmentCacheBatch([large, another])

    expect(await db.fetchDevelopmentCacheForKey(large.id)).toMatchObject(large)
    expect(await db.fetchDevelopmentCacheForKey(another.id)).toMatchObject(another)
    const statements = exec.mock.calls.map(([sql]) => sql)
    expect(statements[0]).toBe('BEGIN TRANSACTION')
    expect(statements.at(-1)).toBe('COMMIT')
    expect(statements.filter(sql => sql.startsWith('UPDATE _development_cache')).length).toBeGreaterThan(1)
  })

  test('restores existing rows and removes new rows when a large value fails midway', async () => {
    const { db, connector } = await open(create)
    await db.insertDevelopmentCache(previous.id, previous.value, previous.checksum)
    const original = connector.exec.bind(connector)
    const failure = new Error('cache continuation failed')
    let updates = 0
    vi.spyOn(connector, 'exec').mockImplementation(async (sql) => {
      if (sql.startsWith('UPDATE _development_cache') && ++updates === 2) {
        throw failure
      }
      return await original(sql)
    })

    await expect(db.insertDevelopmentCacheBatch([another, large])).rejects.toBe(failure)

    expect(await db.fetchDevelopmentCacheForKey(previous.id)).toMatchObject(previous)
    expect(await db.fetchDevelopmentCacheForKey(another.id)).toBeFalsy()
  })
})

test('does not open an empty transaction', async () => {
  const { db, connector } = await open(betterSqlite3)
  const exec = vi.spyOn(connector, 'exec')
  await db.insertDevelopmentCacheBatch([])
  expect(exec).not.toHaveBeenCalled()
})

test('a failed BEGIN preserves the caller transaction', async () => {
  const { db, connector } = await open(nodeSqlite)
  await connector.exec('BEGIN TRANSACTION')
  await db.insertDevelopmentCache(previous.id, previous.value, previous.checksum)
  const exec = vi.spyOn(connector, 'exec')

  await expect(db.insertDevelopmentCacheBatch([another])).rejects.toThrow()

  expect(exec.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN TRANSACTION'])
  expect(await db.fetchDevelopmentCacheForKey(previous.id)).toMatchObject(previous)
  await connector.exec('COMMIT')
  expect(await db.fetchDevelopmentCacheForKey(previous.id)).toMatchObject(previous)
})

test('awaits an asynchronous COMMIT failure and preserves it when rollback also fails', async () => {
  const { db, connector } = await open(nodeSqlite)
  const original = connector.exec.bind(connector)
  const failure = new Error('commit failed')
  const statements: string[] = []
  vi.spyOn(connector, 'exec').mockImplementation(async (sql) => {
    await new Promise(resolve => setImmediate(resolve))
    statements.push(sql)
    if (sql === 'COMMIT') {
      throw failure
    }
    await original(sql)
    if (sql === 'ROLLBACK') {
      throw new Error('rollback reporting failed')
    }
  })

  await expect(db.insertDevelopmentCacheBatch([another])).rejects.toBe(failure)

  expect(statements.at(-1)).toBe('ROLLBACK')
  expect(await db.fetchDevelopmentCacheForKey(another.id)).toBeFalsy()
})

test('D1 capability uses awaited writes without transaction SQL', async () => {
  // Real SQLite storage with a delayed connector is a control for the D1
  // capability branch, not a substitute for a hosted D1 integration test.
  const { db, connector } = await open(betterSqlite3, true)
  const original = connector.exec.bind(connector)
  const statements: string[] = []
  vi.spyOn(connector, 'exec').mockImplementation(async (sql) => {
    await new Promise(resolve => setImmediate(resolve))
    statements.push(sql)
    if (/^(?:BEGIN|COMMIT|ROLLBACK)/.test(sql)) {
      throw new Error('D1 does not support SQL transactions')
    }
    return await original(sql)
  })

  expect(db.supportsTransactions).toBe(false)
  await db.insertDevelopmentCacheBatch([another, large])

  expect(await db.fetchDevelopmentCacheForKey(another.id)).toMatchObject(another)
  expect(await db.fetchDevelopmentCacheForKey(large.id)).toMatchObject(large)
  expect(statements.length).toBeGreaterThan(2)
})
