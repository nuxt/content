import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import type { Nuxt } from '@nuxt/schema'
import { afterAll, describe, expect, test } from 'vitest'
import { loadContentConfig } from '../src/utils/config'
import { decompressSQLDump } from '../src/runtime/internal/dump'
import { getTableName } from '../src/utils/collection'
import { getLocalDatabase } from '../src/utils/database'
import { initiateValidatorsContext } from '../src/utils/dependencies'
import type { LocalDevelopmentDatabase } from '../src/module'

const resolver = createResolver(import.meta.url)

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/basic/node_modules'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/basic/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/basic/.data'), { recursive: true, force: true })
}

describe('basic', async () => {
  await initiateValidatorsContext()

  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/basic'),
    dev: true,
  })

  describe('`content.config.ts`', async () => {
    test('Default collection is defined', async () => {
      const rootDir = resolver.resolve('./fixtures/basic')
      const config = await loadContentConfig({ options: { _layers: [{ config: { rootDir } }] } } as Nuxt)

      // Pages collection + info collection
      expect(config.collections.length).toBe(2)
      expect(config.collections.map(c => c.name)).toContain('content')

      const pagesCollection = config.collections.find(c => c.name === 'content')
      expect(pagesCollection).toBeDefined()
      expect(pagesCollection?.type).toBe('page')
      expect(pagesCollection?.source).toBeDefined()
      expect(pagesCollection?.source![0]).toBeDefined()
      expect(pagesCollection?.source![0].include).toBe('**')
    })
  })

  describe('Local database', () => {
    let db: LocalDevelopmentDatabase
    afterAll(async () => {
      if (db) {
        await db.close()
      }
    })
    test('is created', async () => {
      const stat = await fs.stat(resolver.resolve('./fixtures/basic/.data/content/contents.sqlite'))
      expect(stat?.isFile()).toBe(true)
    })

    test('load database', async () => {
      db = await getLocalDatabase({ type: 'sqlite', filename: resolver.resolve('./fixtures/basic/.data/content/contents.sqlite') }, { nativeSqlite: true })
    })

    test('content table is created', async () => {
      const cache = await db.database?.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`)
        .all(getTableName('content')) as { name: string }[]

      expect(cache).toBeDefined()
      expect(cache).toHaveLength(1)
      expect(cache![0].name).toBe(getTableName('content'))
    })
  })

  describe.skip('SQL dump', () => {
    test('is generated', async () => {
      const dump = await import(resolver.resolve('./fixtures/basic/.nuxt/content/database.compressed.mjs')).then(m => m.content)

      const parsedDump = await decompressSQLDump(dump)

      expect(parsedDump.filter(item => item.startsWith('DROP TABLE IF EXISTS'))).toHaveLength(1)
      expect(parsedDump.filter(item => item.startsWith('CREATE TABLE IF NOT EXISTS'))).toHaveLength(2)
      // Only info & home page are inserted
      expect(parsedDump.filter(item => item.startsWith('INSERT INTO'))).toHaveLength(2)
    })

    test('is downloadable', async () => {
      const response: string = await $fetch('/__nuxt_content/content/sql_dump.txt', { responseType: 'text' })
      expect(response).toBeDefined()

      const parsedDump = await decompressSQLDump(response as string)

      expect(parsedDump.filter(item => item.startsWith('DROP TABLE IF EXISTS'))).toHaveLength(1)
      expect(parsedDump.filter(item => item.startsWith('CREATE TABLE IF NOT EXISTS'))).toHaveLength(2)
      // Only info & home page is inserted
      expect(parsedDump.filter(item => item.startsWith('INSERT INTO'))).toHaveLength(2)
    })
  })

  describe('refine retrieved document', () => {
    test('retrieve document', async () => {
      const doc: Record<string, unknown> = await $fetch('/api/content/get?path=/')

      expect(doc).toBeDefined()
      expect(typeof doc.booleanField).toBe('boolean')
      expect(doc.booleanField).toBe(true)
      expect(doc.arrayField).toBeDefined()
      expect(doc.arrayField).toContain('item1')
      expect(doc.arrayField).toContain('item2')
      expect(doc.numberField).toBe(1)
    })
  })
})
