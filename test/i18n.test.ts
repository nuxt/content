import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'
import { getLocalDatabase } from '../src/utils/database'
import { getTableName } from '../src/utils/collection'
import { initiateValidatorsContext } from '../src/utils/dependencies'
import type { LocalDevelopmentDatabase } from '../src/module'

const resolver = createResolver(import.meta.url)

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/i18n/node_modules'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/i18n/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/i18n/.data'), { recursive: true, force: true })
}

describe('i18n', async () => {
  await initiateValidatorsContext()

  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/i18n'),
    dev: true,
    port: 0, // Let OS assign a free port to avoid EADDRINUSE on CI
  })

  describe('database', () => {
    let db: LocalDevelopmentDatabase
    afterAll(async () => {
      if (db) {
        await db.close()
      }
    })

    test('local database is created', async () => {
      const stat = await fs.stat(resolver.resolve('./fixtures/i18n/.data/content/contents.sqlite'))
      expect(stat?.isFile()).toBe(true)
    })

    test('blog table exists with locale column', async () => {
      db = await getLocalDatabase({ type: 'sqlite', filename: resolver.resolve('./fixtures/i18n/.data/content/contents.sqlite') }, { nativeSqlite: true })

      const tableInfo = await db.database?.prepare(`PRAGMA table_info(${getTableName('blog')});`).all() as { name: string }[]
      const columnNames = tableInfo.map(c => c.name)

      expect(columnNames).toContain('locale')
      expect(columnNames).toContain('path')
      expect(columnNames).toContain('title')
    })

    test('team table exists with locale column', async () => {
      const tableInfo = await db.database?.prepare(`PRAGMA table_info(${getTableName('team')});`).all() as { name: string }[]
      const columnNames = tableInfo.map(c => c.name)

      expect(columnNames).toContain('locale')
      expect(columnNames).toContain('name')
      expect(columnNames).toContain('role')
    })
  })

  describe('path-based i18n (blog collection)', () => {
    test('query English blog posts', async () => {
      const posts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=en')

      expect(posts.length).toBeGreaterThanOrEqual(2)
      const titles = posts.map(p => p.title)
      expect(titles).toContain('Hello World')
      expect(titles).toContain('English Only Post')

      // All posts should have locale = 'en'
      for (const post of posts) {
        expect(post.locale).toBe('en')
      }
    })

    test('query French blog posts', async () => {
      const posts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=fr')

      expect(posts.length).toBeGreaterThanOrEqual(1)
      const titles = posts.map(p => p.title)
      expect(titles).toContain('Bonjour le Monde')

      for (const post of posts) {
        expect(post.locale).toBe('fr')
      }
    })

    test('locale strips path prefix', async () => {
      const posts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=en')
      const helloPost = posts.find(p => p.title === 'Hello World')

      // Path should NOT contain the locale prefix
      expect(helloPost?.path).toBe('/blog/hello')
      expect((helloPost?.path as string)?.startsWith('/en/')).toBe(false)
    })

    test('same content has same path across locales', async () => {
      const enPosts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=en')
      const frPosts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=fr')

      const enHello = enPosts.find(p => p.title === 'Hello World')
      const frHello = frPosts.find(p => p.title === 'Bonjour le Monde')

      // Both should have the same path (locale prefix stripped)
      expect(enHello?.path).toBe('/blog/hello')
      expect(frHello?.path).toBe('/blog/hello')
    })

    test('fallback returns default locale for missing translations', async () => {
      const posts = await $fetch<Record<string, unknown>[]>('/api/content/blog?locale=fr&fallback=en')

      const titles = posts.map(p => p.title)
      // Should include the French translation
      expect(titles).toContain('Bonjour le Monde')
      // Should also include English-only post as fallback
      expect(titles).toContain('English Only Post')
    })

    test('query specific post by path and locale', async () => {
      const post = await $fetch<Record<string, unknown>>('/api/content/blog-first?path=/blog/hello&locale=fr')

      expect(post).toBeDefined()
      expect(post.title).toBe('Bonjour le Monde')
      expect(post.locale).toBe('fr')
    })

    test('fallback for single post returns default when translation missing', async () => {
      const post = await $fetch<Record<string, unknown>>('/api/content/blog-first?path=/blog/only-english&locale=fr&fallback=en')

      expect(post).toBeDefined()
      expect(post.title).toBe('English Only Post')
      expect(post.locale).toBe('en')
    })
  })

  describe('inline i18n (team collection)', () => {
    test('query team member in default locale', async () => {
      const members = await $fetch<Record<string, unknown>[]>('/api/content/team?locale=en')

      expect(members.length).toBeGreaterThanOrEqual(1)
      const jane = members.find(m => m.name === 'Jane Doe')
      expect(jane).toBeDefined()
      expect(jane?.role).toBe('Developer')
      expect(jane?.country).toBe('Switzerland')
      expect(jane?.locale).toBe('en')
    })

    test('query team member in French', async () => {
      const members = await $fetch<Record<string, unknown>[]>('/api/content/team?locale=fr')

      expect(members.length).toBeGreaterThanOrEqual(1)
      const jane = members.find(m => m.name === 'Jane Doe')
      expect(jane).toBeDefined()
      expect(jane?.role).toBe('Développeuse')
      expect(jane?.country).toBe('Suisse')
      expect(jane?.locale).toBe('fr')
    })

    test('query team member in German', async () => {
      const members = await $fetch<Record<string, unknown>[]>('/api/content/team?locale=de')

      expect(members.length).toBeGreaterThanOrEqual(1)
      const jane = members.find(m => m.name === 'Jane Doe')
      expect(jane).toBeDefined()
      expect(jane?.role).toBe('Entwicklerin')
      expect(jane?.country).toBe('Schweiz')
      expect(jane?.locale).toBe('de')
      // Name should fall back to default since it's not translated
      expect(jane?.name).toBe('Jane Doe')
    })

    test('non-default locale items have _i18nSourceHash in meta', async () => {
      const members = await $fetch<Record<string, unknown>[]>('/api/content/team?locale=fr')
      const jane = members.find(m => m.name === 'Jane Doe')
      const meta = jane?.meta as Record<string, unknown>

      expect(meta?._i18nSourceHash).toBeDefined()
      expect(typeof meta?._i18nSourceHash).toBe('string')
    })

    test('default locale items do NOT have _i18nSourceHash', async () => {
      const members = await $fetch<Record<string, unknown>[]>('/api/content/team?locale=en')
      const jane = members.find(m => m.name === 'Jane Doe')
      const meta = jane?.meta as Record<string, unknown>

      expect(meta?._i18nSourceHash).toBeUndefined()
    })
  })

  describe('queryCollectionLocales helper', () => {
    test('returns all locale variants for a given stem', async () => {
      const locales = await $fetch<{ locale: string, path: string }[]>(
        '/api/content/locales?collection=blog&stem=blog/hello',
      )

      expect(locales.length).toBe(2)
      const localeCodes = locales.map(l => l.locale).sort()
      expect(localeCodes).toEqual(['en', 'fr'])

      // Both should have the same path
      for (const entry of locales) {
        expect(entry.path).toBe('/blog/hello')
      }
    })

    test('returns single locale for untranslated content', async () => {
      const locales = await $fetch<{ locale: string, path: string }[]>(
        '/api/content/locales?collection=blog&stem=blog/only-english',
      )

      expect(locales.length).toBe(1)
      expect(locales[0].locale).toBe('en')
    })
  })
})
