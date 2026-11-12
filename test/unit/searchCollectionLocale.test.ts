import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNuxtApp } from '#imports'

const state = vi.hoisted(() => ({
  db: undefined as unknown as Database.Database,
}))

vi.mock('#content/manifest', () => ({
  tables: { docs: '_content_docs' },
  checksums: {},
  default: {
    docs: { type: 'page', fields: {}, i18n: { locales: ['en', 'fr'], defaultLocale: 'en' } },
  },
}))

// Content queries and the search index share one database, like the browser WASM database.
vi.mock('../../src/runtime/internal/database.client', () => {
  const parse = (row: Record<string, unknown>) => (typeof row.body === 'string' ? { ...row, body: JSON.parse(row.body) } : row)
  return {
    loadDatabaseAdapter: () => ({
      exec: async (sql: string, params?: unknown[]) => params ? state.db.prepare(sql).run(...params) : state.db.exec(sql),
      all: async (sql: string, params?: unknown[]) => state.db.prepare(sql).all(...(params || [])).map(row => parse(row as Record<string, unknown>)),
      first: async (sql: string, params?: unknown[]) => state.db.prepare(sql).get(...(params || [])),
    }),
  }
})

const locale = { value: 'en' }
const body = (text: string) => JSON.stringify({ type: 'minimark', value: [['p', {}, text]] })

beforeEach(() => {
  // A fresh module graph resets the shared search index, like a page load.
  vi.resetModules()
  locale.value = 'en'
  ;(useNuxtApp() as unknown as { $i18n: unknown }).$i18n = { locale }

  state.db = new Database(':memory:')
  state.db.exec('CREATE TABLE _content_docs (id TEXT, stem TEXT, locale TEXT, path TEXT, title TEXT, body TEXT, description TEXT, extension TEXT, navigation TEXT, meta TEXT, seo TEXT)')
  const insert = state.db.prepare('INSERT INTO _content_docs VALUES (?, ?, ?, ?, ?, ?, \'\', \'md\', \'true\', \'{}\', \'{}\')')
  insert.run('docs/en/guide.md', 'guide', 'en', '/guide', 'Hello guide', body('english words'))
  insert.run('docs/fr/guide.md', 'guide', 'fr', '/guide', 'Bonjour guide', body('mots francais'))
})

describe('useSearchCollection with i18n collections', () => {
  it('searches the active locale after a locale switch', async () => {
    const { useSearchCollection } = await import('../../src/runtime/client')
    const search = useSearchCollection('docs' as never, { immediate: false })
    expect((await search.search('guide')).map(result => result.title)).toEqual(['Hello guide'])

    locale.value = 'fr'

    expect((await search.search('guide')).map(result => result.title)).toEqual(['Bonjour guide'])
  })

  it('does not reuse another locale index in an instance created after the switch', async () => {
    const { useSearchCollection } = await import('../../src/runtime/client')
    await useSearchCollection('docs' as never, { immediate: false }).init()

    locale.value = 'fr'
    const search = useSearchCollection('docs' as never, { immediate: false })

    expect((await search.search('guide')).map(result => result.title)).toEqual(['Bonjour guide'])
  })
})
