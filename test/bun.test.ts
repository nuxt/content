import { afterAll, describe, expect, test } from 'bun:test'
import type { LocalDevelopmentDatabase } from '../src/types/index.ts'
import { getLocalDatabase } from '../src/utils/sqlite.ts'

describe('Local database', () => {
  let db: LocalDevelopmentDatabase
  afterAll(async () => {
    if (db) {
      await db.close()
    }
  })
  test('Is Bun', async () => {
    expect(process.versions.bun).toBeDefined()
  })

  test('load database', async () => {
    db = await getLocalDatabase(':memory:')
    expect(db).toBeDefined()
  })

  test('SQL: Create table', async () => {
    await db.exec('CREATE TABLE IF NOT EXISTS test (id TEXT PRIMARY KEY, name TEXT)')
    const tables = await db.database?.all<{ name: string }>('SELECT name FROM sqlite_master WHERE type = ?', ['table'])
    expect(tables).toBeDefined()
    if (tables) {
      expect(tables.map(t => t.name)).toContain('test')
    }
  })

  test('SQL: Insert data', async () => {
    await db.exec('INSERT INTO test (id, name) VALUES ("1", "Hello")')
    const data = await db.database?.first<{ id: string, name: string }>('SELECT * FROM test')
    expect(data).toBeDefined()
    expect(data?.id).toBe('1')
    expect(data?.name).toBe('Hello')
  })

  test('SQL: Empty table', async () => {
    await db.exec('DELETE FROM test')
    const data = await db.database?.first<{ id: string, name: string }>('SELECT * FROM test')
    expect(data).toBeNull()
  })

  test('SQL: Drop table', async () => {
    await db.exec('DROP TABLE test')
    const tables = await db.database?.all<{ name: string }>('SELECT name FROM sqlite_master WHERE type = ?', ['table'])
    expect(tables).toBeDefined()
    if (tables) {
      expect(tables.map(t => t.name)).not.toContain('test')
    }
  })
})
