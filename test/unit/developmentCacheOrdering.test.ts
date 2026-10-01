import { randomUUID } from 'node:crypto'
import { setImmediate } from 'node:timers/promises'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import type { Connector } from 'db0'
import betterSqliteConnector from 'db0/connectors/better-sqlite3'
import nodeSqliteConnector from 'db0/connectors/node-sqlite'
import { getLocalDatabase } from '../../src/utils/database'
import { MAX_SQL_QUERY_SIZE } from '../../src/utils/collection'

async function openDatabase(connector: Connector) {
  const db = await getLocalDatabase({ type: 'sqlite', filename: randomUUID() }, { connector })
  onTestFinished(async () => {
    try {
      db.close()
    }
    finally {
      await connector.dispose?.()
    }
  })
  return db
}

describe('development cache write ordering', () => {
  test('waits for deletion to finish before inserting the replacement', async () => {
    const connector = nodeSqliteConnector({ name: ':memory:' })
    const db = await openDatabase(connector)
    await db.insertDevelopmentCache('document', 'old value', 'old checksum')
    const deletion = Promise.withResolvers<undefined>()
    const prepare = connector.prepare.bind(connector)
    vi.spyOn(connector, 'prepare').mockImplementation((sql) => {
      const statement = prepare(sql)
      if (sql.startsWith('DELETE FROM _development_cache')) {
        const run = statement.run.bind(statement)
        vi.spyOn(statement, 'run').mockImplementation(async (...params) => {
          await deletion.promise
          return run(...params)
        })
      }
      return statement
    })
    const exec = vi.spyOn(connector, 'exec')
    let settled = false
    const write = Promise.resolve(db.insertDevelopmentCache('document', 'new value', 'new checksum'))
      .then(() => { settled = true }, (error) => {
        settled = true
        return error
      })
    // Drain microtasks while the actual deletion remains blocked.
    await setImmediate()
    const insertedBeforeDeletion = exec.mock.calls.length
    const settledBeforeDeletion = settled
    deletion.resolve(undefined)
    const error = await write
    expect(insertedBeforeDeletion).toBe(0)
    expect(settledBeforeDeletion).toBe(false)
    expect(error).toBeUndefined()
    expect(await db.fetchDevelopmentCacheForKey('document')).toMatchObject({
      id: 'document', value: 'new value', checksum: 'new checksum',
    })
  })

  test('propagates deletion failure without inserting a replacement', async () => {
    const connector = nodeSqliteConnector({ name: ':memory:' })
    const db = await openDatabase(connector)
    await db.insertDevelopmentCache('document', 'old value', 'old checksum')
    const failure = new Error('cache deletion failed')
    const prepare = connector.prepare.bind(connector)
    vi.spyOn(connector, 'prepare').mockImplementation((sql) => {
      const statement = prepare(sql)
      if (sql.startsWith('DELETE FROM _development_cache')) {
        vi.spyOn(statement, 'run').mockRejectedValue(failure)
      }
      return statement
    })
    const exec = vi.spyOn(connector, 'exec')
    await expect(db.insertDevelopmentCache('document', 'new value', 'new checksum')).rejects.toBe(failure)
    expect(exec).not.toHaveBeenCalled()
    expect(await db.fetchDevelopmentCacheForKey('document')).toMatchObject({
      id: 'document', value: 'old value', checksum: 'old checksum',
    })
  })

  test.each([
    ['better-sqlite3', betterSqliteConnector],
    ['node-sqlite', nodeSqliteConnector],
  ] as const)('retains replacements and split values with %s', async (_name, createConnector) => {
    const db = await openDatabase(createConnector({ name: ':memory:' }))
    await db.insertDevelopmentCache('document', 'old value', 'old checksum')
    expect(await db.fetchDevelopmentCacheForKey('document')).toMatchObject({
      id: 'document', value: 'old value', checksum: 'old checksum',
    })
    const value = 'a'.repeat(MAX_SQL_QUERY_SIZE * 2)
    await db.insertDevelopmentCache('document', value, 'new checksum')
    expect(await db.fetchDevelopmentCacheForKey('document')).toMatchObject({
      id: 'document', value, checksum: 'new checksum',
    })
  })
})
