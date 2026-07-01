import { describe, it, expect, afterAll } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { getLocalDatabase } from '../../src/utils/database'

// Guards the argument order of `insertDevelopmentCache(id, value, checksum)`,
// which the dev HMR re-parse path was previously calling with value/checksum swapped.
describe('development cache', () => {
  let dir: string
  let db: Awaited<ReturnType<typeof getLocalDatabase>>

  afterAll(async () => {
    await db?.close?.()
    if (dir) {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('stores value and checksum in their own columns', async () => {
    dir = await mkdtemp(join(tmpdir(), 'nc-cache-'))
    db = await getLocalDatabase({ type: 'sqlite', filename: join(dir, 'contents.sqlite') }, { nativeSqlite: true })

    await db.insertDevelopmentCache('content/index.md', '{"parsed":true}', 'checksum-123')
    const row = await db.fetchDevelopmentCacheForKey('content/index.md')

    expect(row?.value).toBe('{"parsed":true}')
    expect(row?.checksum).toBe('checksum-123')
  })
})
