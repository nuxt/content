import Database from 'better-sqlite3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#imports'

const state = vi.hoisted(() => ({
  db: undefined as unknown as Database.Database,
  inserts: [] as string[],
  // Holds the first content query on `_content_docs` until released.
  gate: undefined as Promise<void> | undefined,
  gateHit: false,
}))

vi.mock('#content/manifest', () => ({
  tables: { docs: '_content_docs', blog: '_content_blog', notes: '_content_notes' },
  checksums: {},
  default: {
    docs: { type: 'page', fields: {}, i18n: { locales: ['en', 'fr'], defaultLocale: 'en' } },
    blog: { type: 'page', fields: {} },
    notes: { type: 'page', fields: {} },
  },
}))

const parse = vi.hoisted(() => (row: unknown) => {
  const value = row as Record<string, unknown>
  return typeof value.body === 'string' ? { ...value, body: JSON.parse(value.body) } : value
})

// Content queries and the search index share one database, like the browser WASM database.
vi.mock('../../src/runtime/internal/api', () => ({
  fetchQuery: async (_event: unknown, _collection: string, sql: string) => {
    if (state.gate && !state.gateHit && sql.includes('_content_docs')) {
      state.gateHit = true
      await state.gate
    }
    return state.db.prepare(sql).all().map(parse)
  },
}))

vi.mock('../../src/runtime/internal/database.client', () => {
  return {
    loadDatabaseAdapter: () => ({
      exec: async (sql: string, params?: unknown[]) => {
        if (sql.startsWith('INSERT INTO _fts_search')) {
          state.inserts.push(String(params![0]))
        }
        return params ? state.db.prepare(sql).run(...params) : state.db.exec(sql)
      },
      all: async (sql: string, params?: unknown[]) => state.db.prepare(sql).all(...(params || [])).map(parse),
      first: async (sql: string, params?: unknown[]) => state.db.prepare(sql).get(...(params || [])),
    }),
  }
})

// A new ref per test, so watchers of earlier tests never fire again.
let locale: Ref<string>
const body = (text: string) => JSON.stringify({ type: 'minimark', value: [['p', {}, text]] })

beforeEach(() => {
  // A fresh module graph resets the shared search index, like a page load.
  vi.resetModules()
  // Content queries take the server path, only the search index uses the client adapter.
  vi.stubGlobal('WebAssembly', undefined)
  locale = ref('en')
  ;(useNuxtApp() as unknown as { $i18n: unknown }).$i18n = { locale }

  state.inserts = []
  state.gate = undefined
  state.gateHit = false
  state.db = new Database(':memory:')
  state.db.exec('CREATE TABLE _content_docs (id TEXT, stem TEXT, locale TEXT, path TEXT, title TEXT, body TEXT, description TEXT, extension TEXT, navigation TEXT, meta TEXT, seo TEXT)')
  state.db.exec('CREATE TABLE _content_blog (id TEXT, stem TEXT, path TEXT, title TEXT, body TEXT, description TEXT, extension TEXT, navigation TEXT, meta TEXT, seo TEXT)')
  state.db.exec('CREATE TABLE _content_notes (id TEXT, stem TEXT, path TEXT, title TEXT, body TEXT, description TEXT, extension TEXT, navigation TEXT, meta TEXT, seo TEXT)')
  const insert = state.db.prepare('INSERT INTO _content_docs VALUES (?, ?, ?, ?, ?, ?, \'\', \'md\', \'true\', \'{}\', \'{}\')')
  insert.run('docs/en/guide.md', 'guide', 'en', '/guide', 'Hello guide', body('english words'))
  insert.run('docs/fr/guide.md', 'guide', 'fr', '/guide', 'Bonjour guide', body('mots francais'))
  state.db.prepare('INSERT INTO _content_blog VALUES (?, ?, ?, ?, ?, \'\', \'md\', \'true\', \'{}\', \'{}\')')
    .run('blog/post.md', 'post', '/post', 'Blog guide', body('news'))
})

afterEach(() => {
  vi.unstubAllGlobals()
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

  it('keeps the index of collections without i18n after a locale switch', async () => {
    const { useSearchCollection } = await import('../../src/runtime/client')
    const search = useSearchCollection(['docs', 'blog'] as never, { immediate: false })
    expect((await search.search('guide')).map(result => result.title).sort()).toEqual(['Blog guide', 'Hello guide'])

    locale.value = 'fr'

    expect((await search.search('guide')).map(result => result.title).sort()).toEqual(['Blog guide', 'Bonjour guide'])
    expect(state.inserts.filter(name => name === 'blog')).toHaveLength(1)
  })

  it('keeps only the latest locale when builds overlap', async () => {
    const { useSearchCollection } = await import('../../src/runtime/client')
    const first = useSearchCollection('docs' as never, { immediate: false }).init()
    locale.value = 'fr'
    const second = useSearchCollection('docs' as never, { immediate: false }).init()
    await Promise.all([first, second])

    const titles = state.db.prepare('SELECT title FROM _fts_search WHERE collection = \'docs\'').all()
    expect(titles).toEqual([{ title: 'Bonjour guide' }])
  })

  it('keeps an instance searchable when another instance resets the index during its build', async () => {
    const { useSearchCollection } = await import('../../src/runtime/client')
    // A plain getter, so no watcher runs.
    let names = ['blog', 'notes']
    const other = useSearchCollection((() => names) as never, { immediate: false })
    await other.init()

    let release!: () => void
    state.gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const search = useSearchCollection('docs' as never, { immediate: false })
    const pending = search.init()
    await vi.waitFor(() => expect(state.gateHit).toBe(true))

    // Removing a collection resets the shared index while the docs build waits.
    names = ['blog']
    await other.init()
    release()
    await pending

    expect(search.status.value).toBe('ready')
    expect((await search.search('guide')).map(result => result.title)).toEqual(['Hello guide'])
  })
})
