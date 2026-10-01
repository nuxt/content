import { describe, expect, test } from 'vitest'
import type { Connector } from 'db0'
import type { CacheEntry } from '../../src/types'
import { databaseVersion, getLocalDatabase } from '../../src/utils/database'

async function fetchCache(rows: CacheEntry[]) {
  const connector = {
    exec: async () => {},
    prepare: () => ({
      get: async () => ({ value: databaseVersion }),
      all: async () => rows,
    }),
  } as unknown as Connector
  const db = await getLocalDatabase({ type: 'sqlite', filename: ':cache-index-test:' }, { connector })
  try {
    return await db.fetchDevelopmentCache()
  }
  finally {
    db.close()
  }
}

describe('fetchDevelopmentCache', () => {
  test('returns an ordinary empty object for no rows', async () => {
    const cache = await fetchCache([])
    expect(cache).toEqual({})
    expect(Object.getPrototypeOf(cache)).toBe(Object.prototype)
  })

  test('indexes complete rows by id, keeping the last duplicate', async () => {
    const first = { id: 'first', value: 'old', checksum: 'old-checksum' }
    const second = { id: 'second', value: 'other', checksum: 'other-checksum' }
    const replacement = { id: 'first', value: 'new', checksum: 'new-checksum' }
    const cache = await fetchCache([first, second, replacement])
    expect(Object.keys(cache)).toEqual(['first', 'second'])
    expect(cache.first).toBe(replacement)
    expect(cache.second).toBe(second)
  })

  test('preserves special ids as ordinary own properties', async () => {
    const rows = ['__proto__', 'constructor'].map(id => ({ id, value: id, checksum: id }))
    const cache = await fetchCache(rows)
    expect(Object.getPrototypeOf(cache)).toBe(Object.prototype)
    for (const row of rows) {
      expect(Object.getOwnPropertyDescriptor(cache, row.id)).toEqual({
        value: row,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    }
  })
})
