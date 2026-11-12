import Database from 'better-sqlite3'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { refineContentFields } from '../../src/runtime/internal/collection'
import { generateCollectionLocales } from '../../src/runtime/internal/locales'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'
import { assertSafeQuery, MAX_SQL_QUERY_LENGTH } from '../../src/runtime/internal/security'
import { defineCollection, generateCollectionInsert, generateCollectionTableDefinition, resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import type { ResolvedCollection } from '../../src/types'

vi.mock('#content/manifest', () => ({
  tables: { docs: '_content_docs' },
  default: {
    docs: { type: 'page', fields: { featured: 'boolean' }, i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' } },
  },
}))

let collection: ResolvedCollection
let db: Database.Database
let queries: string[]

function insert(locale: string, stem: string, data: { title: string, date: string, status?: string, featured?: boolean }) {
  const item = { id: `docs/${locale}/${stem}.md`, stem, locale, path: `/${stem}`, extension: 'md', meta: {}, status: 'published', ...data }
  for (const query of generateCollectionInsert(collection, item).queries) {
    db.exec(query)
  }
}

async function fetch(name: string, sql: string) {
  assertSafeQuery(sql, name)
  queries.push(sql)
  // Like the database adapters
  return db.prepare(sql).all().map(row => refineContentFields(sql, row)) as never[]
}

const query = () => collectionQueryBuilder('docs' as never, fetch)
const titles = (rows: unknown[]) => rows.map(row => (row as { title: string }).title)
const utf8Length = (sql: string) => new TextEncoder().encode(sql).length

beforeAll(async () => {
  await initiateValidatorsContext()
  collection = resolveCollection('docs', defineCollection({
    type: 'page',
    source: '*/docs/**',
    schema: z.object({ date: z.string(), status: z.string(), featured: z.boolean().optional() }),
    i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
  }))!
})

beforeEach(() => {
  db = new Database(':memory:')
  for (const statement of generateCollectionTableDefinition(collection).split('\n')) {
    db.exec(statement)
  }
  queries = []

  insert('en', 'a', { title: 'A', date: '2024-01-03' })
  insert('en', 'b', { title: 'B', date: '2024-01-01', featured: false })
  insert('en', 'c', { title: 'C', date: '2024-01-02' })
  insert('en', 'd', { title: 'D', date: '2024-01-04' })
  insert('fr', 'a', { title: 'A fr', date: '2024-01-03' })
  insert('fr', 'c', { title: 'C fr', date: '2024-01-02', status: 'hidden', featured: true })
})

describe('locale fallback', () => {
  it('serves each stem from the requested locale and fills the rest from the fallback', async () => {
    const rows = await query().locale('fr', { fallback: 'en' }).all()
    expect(titles(rows)).toEqual(['A fr', 'B', 'C fr', 'D'])
  })

  it('applies the detected non-default locale with fallback to the default locale', async () => {
    const rows = await collectionQueryBuilder('docs' as never, fetch, 'fr').all()
    expect(titles(rows)).toEqual(['A fr', 'B', 'C fr', 'D'])
  })

  it('serves the default locale when the active locale is not a collection locale', async () => {
    const es = () => collectionQueryBuilder('docs' as never, fetch, 'es')
    expect(titles(await es().all())).toEqual(['A', 'B', 'C', 'D'])
    expect(await es().path('/a').first()).toMatchObject({ title: 'A', locale: 'en' })
    expect(await es().count()).toBe(4)
  })

  it('keeps the database order of a custom order across both locales', async () => {
    const rows = await query().locale('fr', { fallback: 'en' }).order('date' as never, 'DESC').limit(2).all()
    expect(titles(rows)).toEqual(['D', 'A fr'])
  })

  it('returns the first item of the ordered result', async () => {
    const row = await query().locale('fr', { fallback: 'en' }).order('date' as never, 'ASC').first()
    expect(row).toMatchObject({ title: 'B', locale: 'en' })
  })

  it('does not replace a translation that exists but fails the filters', async () => {
    const rows = await query().locale('fr', { fallback: 'en' }).where('status', '=', 'published').all()
    expect(titles(rows)).toEqual(['A fr', 'B', 'D'])
  })

  it('applies skip together with limit, and ignores skip without limit like a single query', async () => {
    expect(titles(await query().locale('fr', { fallback: 'en' }).skip(1).limit(2).all())).toEqual(['B', 'C fr'])
    expect(titles(await query().locale('fr', { fallback: 'en' }).skip(2).all())).toEqual(['A fr', 'B', 'C fr', 'D'])
    expect(titles(await query().skip(2).all())).toHaveLength(6)
  })

  it('treats a limit that is not a positive number as no limit, like a single query', async () => {
    const all = ['A fr', 'B', 'C fr', 'D']
    expect(titles(await query().locale('fr', { fallback: 'en' }).limit(Number.NaN).all())).toEqual(all)
    expect(titles(await collectionQueryBuilder('docs' as never, fetch, 'fr').limit(Number.NaN).all())).toEqual(all)
    expect(titles(await query().locale('fr', { fallback: 'en' }).skip('1' as never).limit('2' as never).all())).toEqual(['B', 'C fr'])
  })

  it('ignores a negative skip like a single query', async () => {
    const page = (skip: number) => query().locale('fr', { fallback: 'en' }).skip(skip).limit(2).all()
    expect(titles(await page(-1))).toEqual(titles(await page(0)))
  })

  it('uses the builder state at the time of the call', async () => {
    const builder = query().locale('fr', { fallback: 'en' }).limit(2)
    const pending = builder.all()
    builder.skip(1).select('date' as never)

    expect(titles(await pending)).toEqual(['A fr', 'B'])
  })

  it('returns only the selected fields', async () => {
    const rows = await query().locale('fr', { fallback: 'en' }).select('title' as never).limit(2).all()
    expect(rows).toEqual([{ title: 'A fr' }, { title: 'B' }])
  })

  it('reads full rows only for the requested page', async () => {
    await query().locale('fr', { fallback: 'en' }).first()
    const selectAll = queries.filter(sql => sql.startsWith('SELECT * '))
    expect(selectAll).toEqual(['SELECT * FROM _content_docs WHERE ("id" IN (\'docs/fr/a.md\')) ORDER BY stem ASC'])
  })

  it('counts the resolved rows, ignoring select and pagination', async () => {
    const builder = () => query().locale('fr', { fallback: 'en' }).select('title' as never).skip(10).limit(1)
    expect(await builder().count()).toBe(4)
    expect(await builder().count('status' as never, true)).toBe(2)
    expect(await query().locale('fr', { fallback: 'en' }).where('status', '=', 'published').count()).toBe(3)
  })

  it('counts an unfiltered fallback query with one COUNT', async () => {
    expect(await query().locale('fr', { fallback: 'en' }).count()).toBe(4)
    expect(await collectionQueryBuilder('docs' as never, fetch, 'fr').count()).toBe(4)
    expect(queries).toEqual(Array.from({ length: 2 }, () => 'SELECT COUNT(DISTINCT stem) as count FROM _content_docs WHERE ("locale" IN (\'fr\', \'en\')) ORDER BY stem ASC'))
  })

  it('skips NULL values when counting a field, like SQL', async () => {
    const counts = async (builder: () => ReturnType<typeof query>) => [await builder().count('featured' as never), await builder().count('featured' as never, true)]
    const fallback = await counts(() => query().locale('fr', { fallback: 'en' }))

    expect(fallback).toEqual([2, 2])
    expect(await counts(() => query().where('locale', '=', 'en'))).toEqual([1, 1])
  })

  it('returns consistent results for concurrent terminal methods on one builder', async () => {
    const builder = query().locale('fr', { fallback: 'en' }).select('title' as never)
    const [rows, count] = await Promise.all([builder.all(), builder.count()])
    expect(rows).toEqual([{ title: 'A fr' }, { title: 'B' }, { title: 'C fr' }, { title: 'D' }])
    expect(count).toBe(4)
  })

  it('splits long stem and id lists into queries the server accepts', async () => {
    for (let i = 0; i < 250; i++) {
      insert('en', `extra-${String(i).padStart(3, '0')}-${'x'.repeat(200)}`, { title: `Extra ${i}`, date: '2023-01-01' })
    }

    const rows = await query().locale('fr', { fallback: 'en' }).where('status', '=', 'published').limit(240).all()

    expect(rows).toHaveLength(240)
    expect(titles(rows).slice(0, 2)).toEqual(['A fr', 'B'])
    expect(Math.max(...queries.map(sql => sql.length))).toBeLessThan(MAX_SQL_QUERY_LENGTH / 2)
  })

  it('reads many untranslated stems with few queries', async () => {
    for (let i = 0; i < 1000; i++) {
      insert('en', `bulk-${String(i).padStart(4, '0')}`, { title: `Bulk ${i}`, date: '2023-01-01' })
    }

    queries = []
    expect(await query().locale('fr', { fallback: 'en' }).where('status', '=', 'published').all()).toHaveLength(1003)
    expect(queries).toHaveLength(2)

    queries = []
    expect(await query().locale('fr', { fallback: 'en' }).count('title' as never)).toBe(1004)
    expect(queries).toHaveLength(2)
  })

  it('keeps every statement under 100,000 UTF-8 bytes for multibyte ids', async () => {
    for (let i = 0; i < 150; i++) {
      insert('en', `${String(i).padStart(3, '0')}-${'文'.repeat(340)}`, { title: `Long ${i}`, date: '2023-01-01' })
    }

    expect(await query().locale('fr', { fallback: 'en' }).limit(120).all()).toHaveLength(120)
    expect(Math.max(...queries.map(sql => utf8Length(sql)))).toBeLessThan(100_000)
  })
})

describe('paged locale fallback', () => {
  const insertMany = (rows: Array<[string, string, { title: string, date: string, status?: string }]>) => {
    db.transaction(() => rows.forEach(([locale, stem, data]) => insert(locale, stem, data)))()
  }
  const pagesMatch = async (build: () => ReturnType<typeof query>, pages: Array<[number, number]>) => {
    const all = titles(await build().all())
    for (const [skip, limit] of pages) {
      expect(titles(await build().skip(skip).limit(limit).all()), `skip(${skip}).limit(${limit})`).toEqual(all.slice(skip, skip + limit))
    }
  }

  it('reads key rows for the requested page only', async () => {
    insertMany(Array.from({ length: 2000 }, (_, i) => ['en', `z-${String(i).padStart(4, '0')}`, { title: `Z ${i}`, date: '2023-01-01' }]))
    let rowsRead = 0
    const counting = async (name: string, sql: string) => {
      const rows = await fetch(name, sql)
      rowsRead += rows.length
      return rows
    }
    const fr = () => collectionQueryBuilder('docs' as never, counting).locale('fr', { fallback: 'en' })

    expect(await fr().first()).toMatchObject({ title: 'A fr' })
    expect(rowsRead).toBeLessThan(600)

    rowsRead = 0
    expect(titles(await fr().where('status', '=', 'published').order('date' as never, 'DESC').limit(3).all())).toEqual(['D', 'A fr', 'B'])
    expect(rowsRead).toBeLessThan(600)
  })

  it('resolves pages across window boundaries like the full result', async () => {
    // An odd number of rows before the pairs lets windows end between the two rows of a stem.
    insertMany([
      ['en', 'aa', { title: 'AA', date: '2024-01-05' }],
      ...Array.from({ length: 300 }, (_, i) => ['en', 'fr'].map(locale => [locale, `s-${String(i).padStart(3, '0')}`, { title: `S ${i} ${locale}`, date: '2023-06-01', status: i % 5 ? 'published' : 'hidden' }] as [string, string, { title: string, date: string, status: string }])).flat(),
    ])
    const pages: Array<[number, number]> = [[0, 1], [0, 7], [124, 7], [126, 3], [127, 1], [200, 64], [250, 70], [300, 10]]
    await pagesMatch(() => query().locale('fr', { fallback: 'en' }), pages)
    await pagesMatch(() => query().locale('fr', { fallback: 'en' }).where('status', '=', 'published'), pages)
  })

  it('resolves pages like the full result when translations sort far from their fallback rows', async () => {
    insertMany(Array.from({ length: 400 }, (_, i) => {
      const stem = `z-${String(i).padStart(3, '0')}`
      const rows: Array<[string, string, { title: string, date: string }]> = [['en', stem, { title: `Z ${i}`, date: `2023-01-01T00:${String(Math.floor((999 - i) / 60)).padStart(2, '0')}:${String((999 - i) % 60).padStart(2, '0')}` }]]
      if (i % 3 === 0) {
        rows.push(['fr', stem, { title: `Z ${i} fr`, date: `2000-01-01T00:00:${String(i % 60).padStart(2, '0')}` }])
      }
      return rows
    }).flat())
    await pagesMatch(() => query().locale('fr', { fallback: 'en' }).order('date' as never, 'DESC'), [[0, 1], [0, 5], [10, 20], [120, 10], [200, 60], [250, 40], [500, 50]])
  })

  it('hides a fallback row in a later window when its translation came in an earlier window', async () => {
    // Order: translations of `b-*`, then the hidden fallback rows of `a-*` that fill the
    // first window, then the fallback rows of `b-*` in the last window.
    const second = (i: number) => String(i % 60).padStart(2, '0')
    insertMany([
      ...Array.from({ length: 20 }, (_, i) => ['fr', `b-${String(i).padStart(2, '0')}`, { title: `B ${i} fr`, date: `2026-01-01T00:00:${second(i)}` }] as [string, string, { title: string, date: string }]),
      ...Array.from({ length: 300 }, (_, i) => ['en', `a-${String(i).padStart(3, '0')}`, { title: `A ${i}`, date: `2025-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${second(i)}` }] as [string, string, { title: string, date: string }]),
      ...Array.from({ length: 300 }, (_, i) => ['fr', `a-${String(i).padStart(3, '0')}`, { title: `A ${i} fr`, date: `2000-01-01T00:${String(Math.floor(i / 60)).padStart(2, '0')}:${second(i)}` }] as [string, string, { title: string, date: string }]),
      ...Array.from({ length: 20 }, (_, i) => ['en', `b-${String(i).padStart(2, '0')}`, { title: `B ${i}`, date: `2001-01-01T00:00:${second(i)}` }] as [string, string, { title: string, date: string }]),
    ])
    await pagesMatch(() => query().locale('fr', { fallback: 'en' }).order('date' as never, 'DESC'), [[0, 30], [10, 40], [0, 60]])
  })
})

describe('indexes', () => {
  const plan = (sql: string) => (db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all() as Array<{ detail: string }>).map(step => step.detail).join('\n')

  it('lets default-locale queries use a user index and reads fallback rows in index order', async () => {
    const indexed = resolveCollection('docs', defineCollection({
      type: 'page',
      source: '*/docs/**',
      schema: z.object({ date: z.string(), status: z.string() }),
      indexes: [{ columns: ['path'] }],
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
    }))!
    db = new Database(':memory:')
    for (const statement of generateCollectionTableDefinition(indexed).split('\n')) {
      db.exec(statement)
    }
    for (let i = 0; i < 50; i++) {
      for (const locale of ['en', 'fr']) {
        const stem = `s-${String(i).padStart(2, '0')}`
        for (const statement of generateCollectionInsert(indexed, { id: `docs/${locale}/${stem}.md`, stem, locale, path: `/${stem}`, extension: 'md', meta: {}, title: stem, date: '2024-01-01', status: 'published' }).queries) {
          db.exec(statement)
        }
      }
    }

    expect(await collectionQueryBuilder('docs' as never, fetch, 'en').path('/s-30').first()).toMatchObject({ locale: 'en', stem: 's-30' })
    expect(plan(queries.at(-1)!)).toContain('USING INDEX idx_docs_path')

    await collectionQueryBuilder('docs' as never, fetch, 'fr').all()
    expect(plan(queries.at(-1)!)).not.toContain('TEMP B-TREE')
  })
})

describe('locale variants', () => {
  it('lists every locale version of a stem with an index lookup', async () => {
    const variants = await generateCollectionLocales(query(), 'docs', 'a')

    expect(variants).toEqual(expect.arrayContaining([
      expect.objectContaining({ locale: 'en', stem: 'a', title: 'A', path: '/a' }),
      expect.objectContaining({ locale: 'fr', stem: 'a', title: 'A fr', path: '/a' }),
    ]))
    expect(variants).toHaveLength(2)

    const plan = db.prepare(`EXPLAIN QUERY PLAN ${queries.at(-1)}`).all() as Array<{ detail: string }>
    expect(plan.map(step => step.detail).join('\n')).toMatch(/SEARCH _content_docs USING INDEX/)
  })
})
