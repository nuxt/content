import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import type { Nuxt } from '@nuxt/schema'
import { afterAll, describe, expect, test } from 'vitest'
import { loadContentConfig } from '../src/utils/config'
import { getTableName } from '../src/utils/collection'
import { getLocalDatabase } from '../src/utils/database'
import type { LocalDevelopmentDatabase } from '../src/module'
import { initiateValidatorsContext } from '../src/utils/dependencies'

const resolver = createResolver(import.meta.url)

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/csv/node_modules'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/csv/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/csv/.data'), { recursive: true, force: true })
}

describe('csv single-file collection', async () => {
  await initiateValidatorsContext()
  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/csv'),
    dev: true,
  })

  describe('`content.config.ts`', async () => {
    test('single-file csv source is resolved', async () => {
      const rootDir = resolver.resolve('./fixtures/csv')
      const config = await loadContentConfig({ options: { _layers: [{ config: { rootDir } }] } } as Nuxt)

      expect(config.collections.map(c => c.name)).toContain('people')

      const people = config.collections.find(c => c.name === 'people')
      expect(people?.type).toBe('data')
      expect(people?.source?.[0]?.include).toBe('org/people.csv')

      const source = people?.source?.[0]
      expect(source).toBeDefined()
      if (!source) {
        return
      }

      await source.prepare?.({ rootDir })
      const keys = await source.getKeys?.()
      expect(keys).toEqual(['org/people.csv#1', 'org/people.csv#2'])
    })
  })

  describe('single-file csv rows', () => {
    test('each row becomes an item with top-level fields', async () => {
      const people = await $fetch('/api/people/all') as Array<Record<string, unknown>>

      expect(people).toHaveLength(2)
      expect(people.map(p => p.id).sort()).toEqual([
        'people/org/people.csv#1',
        'people/org/people.csv#2',
      ])

      const alice = people.find(p => (p as { id?: string }).id === 'people/org/people.csv#1') as Record<string, unknown>
      expect(alice).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'Engineer',
      })
      expect(alice).not.toHaveProperty('body')
    })
  })

  describe('Local database', () => {
    let db: LocalDevelopmentDatabase
    afterAll(async () => {
      if (db) {
        await db.close()
      }
    })

    test('people table is created', async () => {
      const stat = await fs.stat(resolver.resolve('./fixtures/csv/.data/content/contents.sqlite'))
      expect(stat?.isFile()).toBe(true)
    })

    test('rows are inserted for each csv record', async () => {
      db = await getLocalDatabase({ type: 'sqlite', filename: resolver.resolve('./fixtures/csv/.data/content/contents.sqlite') }, { nativeSqlite: true })
      const rows = await db.database?.prepare(`SELECT name, email, role FROM ${getTableName('people')} ORDER BY id`).all() as Array<{ name: string, email: string, role: string }>

      expect(rows).toHaveLength(2)
      expect(rows[0]).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'Engineer',
      })
    })
  })
})
