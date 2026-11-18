import Database from 'better-sqlite3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { DatabaseAdapter } from '../../src/types'
import { HEARTBEAT_ID, PRUNED, pruneUnusedPrefixes, readHeartbeat, reclaimPrunedTables, wasPruned, writeHeartbeat } from '../../src/runtime/internal/prune'
import { resolvePruneUnusedPrefixes } from '../../src/utils/collection'

const DAY = 24 * 60 * 60 * 1000
const NOW = 100 * DAY

describe('pruneUnusedPrefixes', () => {
  let sqlite: Database.Database
  let db: DatabaseAdapter
  let onDrop: ((table: string) => Promise<void>) | undefined

  beforeEach(() => {
    sqlite = new Database(':memory:')
    onDrop = undefined
    db = {
      exec: async (sql, params = []) => {
        const drop = sql.match(/^DROP TABLE IF EXISTS (\w+)/)?.[1]
        const result = sqlite.prepare(sql).run(...params)
        if (drop) await onDrop?.(drop)
        return result
      },
      all: async <T>(sql: string, params: unknown[] = []) => sqlite.prepare(sql).all(...params) as T[],
      first: async <T>(sql: string, params: unknown[] = []) => sqlite.prepare(sql).get(...params) as T,
    }
  })

  afterEach(() => sqlite.close())

  /**
   * Create the tables a deployment imports: `<prefix>info`, then one table per collection
   */
  async function deploy(prefix: string, collections: string[], heartbeat?: number) {
    sqlite.exec(`CREATE TABLE IF NOT EXISTS ${prefix}info ("id" TEXT PRIMARY KEY, "version" VARCHAR, "structureVersion" VARCHAR, "ready" BOOLEAN)`)
    for (const collection of collections) {
      sqlite.exec(`CREATE TABLE ${prefix}${collection} ("id" TEXT PRIMARY KEY, "title" VARCHAR)`)
      sqlite.prepare(`INSERT INTO ${prefix}info VALUES (?, 'v', 's', true)`).run(`checksum_${collection}`)
    }
    if (heartbeat !== undefined) {
      await writeHeartbeat(db, `${prefix}info`, heartbeat)
    }
  }

  const tables = () => (sqlite.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`).all() as { name: string }[]).map(r => r.name)
  const prune = (opts: Partial<Parameters<typeof pruneUnusedPrefixes>[1]> = {}) => pruneUnusedPrefixes(db, { infoTable: '_preview_main_info', maxAge: 7 * DAY, now: NOW, dialect: 'sqlite', ...opts })

  it('writes and refreshes the heartbeat', async () => {
    await deploy('_preview_main_', ['docs'])
    expect(await readHeartbeat(db, '_preview_main_info')).toBe(null)
    await writeHeartbeat(db, '_preview_main_info', 1)
    await writeHeartbeat(db, '_preview_main_info', 2)
    expect(await readHeartbeat(db, '_preview_main_info')).toBe('2')
    expect(await readHeartbeat(db, '_missing_info')).toBe(undefined)
  })

  it('drops exactly the tables of unused prefixes', async () => {
    await deploy('_preview_main_', ['docs'], NOW)
    await deploy('_preview_feat_', ['docs', 'authors'], NOW - 8 * DAY)
    sqlite.exec(`CREATE TABLE _fts_search_preview_feat_ (id TEXT)`)

    const dropped = await prune()
    expect([...dropped].sort()).toEqual(['_fts_search_preview_feat_', '_preview_feat_authors', '_preview_feat_docs', '_preview_feat_info'])
    // Info table last, so a prune that stops halfway can be resumed
    expect(dropped.at(-1)).toBe('_preview_feat_info')
    expect(tables()).toEqual(['_preview_main_docs', '_preview_main_info'])
  })

  it('keeps prefixes in use, including a prefix that starts like an unused one', async () => {
    await deploy('_preview_main_', ['docs'], NOW)
    await deploy('_preview_feat_', ['docs'], NOW - 8 * DAY)
    await deploy('_preview_feat_x_', ['docs'], NOW - 1 * DAY)

    await prune()
    expect(tables()).toEqual(['_preview_feat_x_docs', '_preview_feat_x_info', '_preview_main_docs', '_preview_main_info'])
  })

  it('never touches deployments without a heartbeat, nor its own tables', async () => {
    await deploy('_content_', ['docs'])
    await deploy('_preview_main_', ['docs'], NOW - 30 * DAY)
    // A data collection whose name ends with `info`
    await deploy('_preview_main_', ['author_info'])

    expect(await prune()).toEqual([])
    expect(tables()).toEqual(['_content_docs', '_content_info', '_preview_main_author_info', '_preview_main_docs', '_preview_main_info'])
  })

  it('resumes a prune that stopped halfway', async () => {
    await deploy('_preview_main_', ['docs'], NOW)
    await deploy('_preview_feat_', ['docs', 'authors'], NOW - 8 * DAY)
    sqlite.prepare(`UPDATE _preview_feat_info SET "version" = ? WHERE id = ?`).run(PRUNED, HEARTBEAT_ID)
    sqlite.exec('DROP TABLE _preview_feat_docs')

    expect(await prune()).toEqual(['_preview_feat_authors', '_preview_feat_info'])
  })

  it('stops when the owner comes back during the prune', async () => {
    await deploy('_preview_main_', ['docs'], NOW)
    await deploy('_preview_feat_', ['docs', 'authors'], NOW - 8 * DAY)
    // The owner notices right after the first drop
    onDrop = async () => {
      onDrop = undefined
      expect(wasPruned(await readHeartbeat(db, '_preview_feat_info'), true)).toBe(true)
      await reclaimPrunedTables(db, '_preview_feat_info', NOW)
    }

    const dropped = await prune()
    expect(dropped).toHaveLength(1)
    // The owner kept its info table, with a fresh heartbeat and no checksum, so it imports everything again
    expect(sqlite.prepare('SELECT id, version FROM _preview_feat_info').all()).toEqual([{ id: HEARTBEAT_ID, version: String(NOW) }])
    expect(tables().filter(t => t.startsWith('_preview_feat_'))).toHaveLength(2)
  })

  it('prunes at most `limit` prefixes per run', async () => {
    await deploy('_preview_main_', ['docs'], NOW)
    for (const name of ['a', 'b', 'c']) {
      await deploy(`_preview_${name}_`, ['docs'], NOW - 8 * DAY)
    }

    expect(await prune({ limit: 2 })).toHaveLength(4)
    expect(await prune({ limit: 2 })).toHaveLength(2)
    expect(tables()).toEqual(['_preview_main_docs', '_preview_main_info'])
  })

  it('detects that its own tables were pruned', () => {
    expect(wasPruned(PRUNED, false)).toBe(true)
    expect(wasPruned(undefined, true)).toBe(true)
    expect(wasPruned(null, true)).toBe(true)
    expect(wasPruned(String(NOW), true)).toBe(false)
    // First run of the process: no heartbeat yet is expected
    expect(wasPruned(undefined, false)).toBe(false)
    expect(wasPruned(null, false)).toBe(false)
  })
})

describe('resolvePruneUnusedPrefixes', () => {
  it('is disabled by default', () => {
    expect(resolvePruneUnusedPrefixes(undefined)).toBe(false)
    expect(resolvePruneUnusedPrefixes(false)).toBe(false)
  })

  it('defaults to 7 days', () => {
    expect(resolvePruneUnusedPrefixes(true)).toEqual({ maxAge: 604800 })
    expect(resolvePruneUnusedPrefixes({})).toEqual({ maxAge: 604800 })
    expect(resolvePruneUnusedPrefixes({ maxAge: 86400 })).toEqual({ maxAge: 86400 })
  })

  it('rejects a max age under one hour', () => {
    expect(() => resolvePruneUnusedPrefixes({ maxAge: 60 })).toThrow('pruneUnusedPrefixes.maxAge')
    expect(() => resolvePruneUnusedPrefixes({ maxAge: Number.NaN })).toThrow('pruneUnusedPrefixes.maxAge')
  })
})
