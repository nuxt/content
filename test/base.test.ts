import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { setup, $fetch } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'
import { loadContentConfig } from '../src/utils/config'
import { decompressSQLDump } from '../src/runtime/utils/internal/decompressSQLDump'
import { localDatabase } from './utils/database'

async function cleanup() {
  await fs.rm(fileURLToPath(new URL('./fixtures/empty/node_modules', import.meta.url)), { recursive: true, force: true })
  await fs.rm(fileURLToPath(new URL('./fixtures/empty/.nuxt', import.meta.url)), { recursive: true, force: true })
  await fs.rm(fileURLToPath(new URL('./fixtures/empty/.data', import.meta.url)), { recursive: true, force: true })
  await fs.rm(fileURLToPath(new URL('./fixtures/empty/content', import.meta.url)), { recursive: true, force: true })
  await fs.rm(fileURLToPath(new URL('./fixtures/empty/content.config.ts', import.meta.url))).catch(() => {})
}

describe('empty', async () => {
  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/empty', import.meta.url)),
    dev: true,
  })

  test('`content/pages/index.md` is created', async () => {
    const stat = await fs.stat(fileURLToPath(new URL('./fixtures/empty/content/pages/index.md', import.meta.url)))
    expect(stat.isFile()).toBe(true)
  })

  describe('`content.config.ts`', async () => {
    test('is created', async () => {
      const stat = await fs.stat(fileURLToPath(new URL('./fixtures/empty/content.config.ts', import.meta.url)))
      expect(stat.isFile()).toBe(true)
    })
    test('Pages collection is defined', async () => {
      const rootDir = fileURLToPath(new URL('./fixtures/empty', import.meta.url))
      const config = await loadContentConfig(rootDir)

      // Pages collection + _info collection
      expect(config.collections.length).toBe(2)
      expect(config.collections.map(c => c.name)).toContain('pages')

      const pagesCollection = config.collections.find(c => c.name === 'pages')
      expect(pagesCollection).toBeDefined()
      expect(pagesCollection?.type).toBe('page')
      expect(pagesCollection?.source).toBeDefined()
      expect(pagesCollection?.source?.path).toBe('pages/**')
    })
  })

  describe('Local database', () => {
    let db: ReturnType<typeof localDatabase>
    afterAll(async () => {
      if (db) {
        await db.close()
      }
    })
    test('is created', async () => {
      const stat = await fs.stat(fileURLToPath(new URL('./fixtures/empty/.data/content/local.db', import.meta.url)))
      expect(stat.isFile()).toBe(true)
    })

    test('Cache entry is created', async () => {
      const databaseLocation = fileURLToPath(new URL('./fixtures/empty/.data/content/local.db', import.meta.url))
      db = localDatabase(databaseLocation)

      const cache = db.fetchDevelopmentCache()
      expect(cache).ownProperty('pages/index.md')
      expect(cache['pages/index.md'].checksum).toBeDefined()
      expect(cache['pages/index.md'].parsedContent).toBeDefined()
      expect(Object.keys(cache)).toHaveLength(1)
    })

    test('Pages table is created', async () => {
      const cache = db.database.prepare<unknown[], Record<string, unknown>>('SELECT * FROM pages').all()
      expect(cache).toHaveLength(1)
      expect(cache[0].title).toBe('Home')
      expect(cache[0].path).toBe('/')
      expect(cache[0].contentId).toBeDefined()
      expect(cache[0].extension).toBe('md')
      expect(cache[0].weight).toBe('999999999999')
      expect(cache[0].stem).toBe('index')
      expect(cache[0].meta).toBeDefined()
      // Navigation has mixed type of boolean and object, so the value stored in DB is a string
      expect(cache[0].navigation).toBe('true')
    })
  })

  describe('SQL dump', () => {
    test('is generated', async () => {
      const dump = await import(fileURLToPath(new URL('./fixtures/empty/.nuxt/content/dump.mjs', import.meta.url))).then(m => m.default)

      const parsedDump = decompressSQLDump(dump)

      expect(parsedDump.filter(item => item.startsWith('DROP TABLE IF EXISTS'))).toHaveLength(2)
      expect(parsedDump.filter(item => item.startsWith('CREATE TABLE IF NOT EXISTS'))).toHaveLength(2)
      expect(parsedDump.filter(item => item.startsWith('INSERT OR REPLACE INTO'))).toHaveLength(2)
    })

    test('is downloadable', async () => {
      const response = await $fetch<Record<string, unknown>>('/api/database.json')
      expect(response.dump).toBeDefined()
      expect(response.collections).toBeDefined()

      const parsedDump = decompressSQLDump(response.dump as string)

      expect(parsedDump.filter(item => item.startsWith('DROP TABLE IF EXISTS'))).toHaveLength(2)
      expect(parsedDump.filter(item => item.startsWith('CREATE TABLE IF NOT EXISTS'))).toHaveLength(2)
      expect(parsedDump.filter(item => item.startsWith('INSERT OR REPLACE INTO'))).toHaveLength(2)
    })
  })
})
