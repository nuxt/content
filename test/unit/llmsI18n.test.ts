import Database from 'better-sqlite3'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { refineContentFields } from '../../src/runtime/internal/collection'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'
import { defineCollection, generateCollectionInsert, generateCollectionTableDefinition, resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import { localizePath } from '../../src/features/llms/runtime/server/utils'

const state = vi.hoisted(() => ({
  db: undefined as unknown as import('better-sqlite3').Database,
  slug: '',
}))

vi.mock('#content/manifest', () => ({
  tables: { docs: '_content_docs' },
  default: {
    docs: { type: 'page', fields: { body: 'json', meta: 'json', navigation: 'json', seo: 'json' }, i18n: { locales: ['en', 'fr'], defaultLocale: 'en' } },
  },
}))

// Server queries apply no locale until `.locale()` is called.
const serverQuery = vi.hoisted(() => (_event: unknown, collection: string) => collectionQueryBuilder(collection as never, async (_c: string, sql: string) => {
  return state.db.prepare(sql).all().map(row => refineContentFields(sql, row)) as never[]
}))
vi.mock('@nuxt/content/server', () => ({ queryCollection: serverQuery }))
vi.mock('nitropack/runtime', () => ({
  useRuntimeConfig: () => ({ llms: { contentRawMarkdown: { excludeCollections: [] } } }),
}))
vi.mock('h3', async original => ({
  ...await original<typeof import('h3')>(),
  getRouterParams: () => ({ 'slug.md': state.slug }),
  setHeader: () => {},
}))

const page = (locale: string, stem: string, title: string, text: string) => ({
  id: `docs/${locale}/${stem}.md`,
  stem,
  locale,
  path: stem === 'index' ? '/' : `/${stem}`,
  title,
  description: '',
  extension: 'md',
  meta: {},
  navigation: true,
  seo: {},
  body: { type: 'minimark', value: [['h1', {}, title], ['p', {}, text]] },
})

const raw = async (slug: string) => {
  state.slug = slug
  const handler = (await import('../../src/features/llms/runtime/server/routes/raw/[...slug].md.get')).default as unknown as (event: unknown) => Promise<string>
  return handler({})
}

describe('llms with i18n collections', () => {
  beforeAll(async () => {
    await initiateValidatorsContext()
  })

  beforeEach(() => {
    const docs = resolveCollection('docs', defineCollection({ type: 'page', source: '**', schema: z.object({}), i18n: { locales: ['en', 'fr'], defaultLocale: 'en' } }))!
    state.db = new Database(':memory:')
    for (const statement of generateCollectionTableDefinition(docs).split('\n')) {
      state.db.exec(statement)
    }
    for (const row of [page('en', 'docs/foo', 'Foo', 'English text'), page('fr', 'docs/foo', 'Foo FR', 'Texte français'), page('fr', 'docs/bar', 'Bar FR', 'Seulement en français'), page('en', 'index', 'Home', 'Welcome'), page('fr', 'index', 'Accueil', 'Bienvenue'), page('en', 'fr/guide', 'France guide', 'About France'), page('fr', 'guide', 'Guide', 'Guide en français')]) {
      for (const statement of generateCollectionInsert(docs, row as never).queries) {
        state.db.exec(statement)
      }
    }
  })

  it('prefixes the link path of a translation with its locale', () => {
    expect(localizePath('/docs/foo', 'docs', 'fr')).toBe('/fr/docs/foo')
    expect(localizePath('/', 'docs', 'fr')).toBe('/fr')
    expect(localizePath('/docs/foo', 'docs', 'en')).toBe('/docs/foo')
    expect(localizePath('/docs/foo', 'other', 'fr')).toBe('/docs/foo')
  })

  it('keeps the locale in raw links of default-locale paths that start with a locale code', () => {
    expect(localizePath('/fr/guide', 'docs', 'en', true)).toBe('/en/fr/guide')
    expect(localizePath('/fr/guide', 'docs', 'en')).toBe('/fr/guide')
    expect(localizePath('/docs/foo', 'docs', 'en', true)).toBe('/docs/foo')
  })

  it('serves raw Markdown in the locale of the first path segment', async () => {
    expect(await raw('fr/docs/foo.md')).toContain('Texte français')
    expect(await raw('fr/docs/bar.md')).toContain('Seulement en français')
    expect(await raw('docs/foo.md')).toContain('English text')
    expect(await raw('index.md')).toContain('Welcome')
    expect(await raw('fr.md')).toContain('Bienvenue')
    await expect(raw('de/docs/foo.md')).rejects.toMatchObject({ statusCode: 404 })
    expect(await raw('fr/guide.md')).toContain('Guide en français')
    expect(await raw('en/fr/guide.md')).toContain('About France')
  })
})
