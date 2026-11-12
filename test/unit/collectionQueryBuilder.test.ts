import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables and collection metadata from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    articles: '_articles',
    plain: '_plain',
  },
  default: {
    articles: {
      type: 'data',
      fields: {},
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
    },
    // Collection without i18n, used to assert auto-locale is a no-op.
    plain: {
      type: 'data',
      fields: {},
    },
  },
}))

// Mock fetch function
const mockFetch = vi.fn().mockResolvedValue(Promise.resolve([{}]))
const mockCollection = 'articles' as never

describe('collectionQueryBuilder', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('builds a simple select query', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.all()

    expect(mockFetch).toHaveBeenCalledWith('articles', 'SELECT * FROM _articles ORDER BY stem ASC')
  })

  it('builds query with where clause', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.where('title', '=', 'Test Article').all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("title" = \'Test Article\') ORDER BY stem ASC',
    )
  })

  it('builds query with multiple where clauses', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .where('title', '=', 'Test Article')
      .where('published', '=', true)
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("title" = \'Test Article\') AND ("published" = \'1\') ORDER BY stem ASC',
    )
  })

  it('builds query with IN operator', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .where('category', 'IN', ['news', 'tech'])
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("category" IN (\'news\', \'tech\')) ORDER BY stem ASC',
    )
  })

  it('builds query with BETWEEN operator', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .where('date', 'BETWEEN', ['2023-01-01', '2023-12-31'])
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("date" BETWEEN \'2023-01-01\' AND \'2023-12-31\') ORDER BY stem ASC',
    )
  })

  it('builds query with selected fields', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .select('title', 'date', 'author')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT "title", "date", "author" FROM _articles ORDER BY stem ASC',
    )
  })

  it('builds query with order by', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .order('date', 'DESC')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles ORDER BY "date" DESC',
    )
  })

  it('builds query with limit without skip', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .limit(5)
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles ORDER BY stem ASC LIMIT 5',
    )
  })

  it('builds query with limit and offset', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .limit(10)
      .skip(20)
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles ORDER BY stem ASC LIMIT 10 OFFSET 20',
    )
  })

  it('builds query with first()', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.first()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles ORDER BY stem ASC LIMIT 1',
    )
  })

  it('builds count query', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.count()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles ORDER BY stem ASC',
    )
  })

  it('builds distinct count query', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.count('author', true)

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(DISTINCT author) as count FROM _articles ORDER BY stem ASC',
    )
  })

  it('builds query with complex where conditions using andWhere', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .where('published', '=', true)
      .andWhere(group => group
        .where('category', '=', 'tech')
        .orWhere(subgroup => subgroup
          .where('tags', 'LIKE', '%javascript%')
          .where('tags', 'LIKE', '%typescript%'),
        ),
      )
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("published" = \'1\') AND ("category" = \'tech\' AND ("tags" LIKE \'%javascript%\' OR "tags" LIKE \'%typescript%\')) ORDER BY stem ASC',
    )
  })

  it('builds query with path', async () => {
    const query = collectionQueryBuilder('articles' as never, mockFetch)
    await query
      .path('/blog/my-article')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("path" = \'/blog/my-article\') ORDER BY stem ASC',
    )
  })

  it('ignores trailing slash in path', async () => {
    const query = collectionQueryBuilder('articles' as never, mockFetch)
    await query
      .path('/foo/bar/')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("path" = \'/foo/bar\') ORDER BY stem ASC',
    )
  })

  it('keeps root path', async () => {
    const query = collectionQueryBuilder('articles' as never, mockFetch)
    await query
      .path('/')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("path" = \'/\') ORDER BY stem ASC',
    )
  })

  it('builds query with locale', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query
      .locale('fr')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("locale" = \'fr\') ORDER BY stem ASC',
    )
  })

  it('builds query with locale and path', async () => {
    const query = collectionQueryBuilder('articles' as never, mockFetch)
    await query
      .locale('de')
      .path('/blog/post')
      .all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("locale" = \'de\') AND ("path" = \'/blog/post\') ORDER BY stem ASC',
    )
  })

  it('.stem() matches the stored stem exactly', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.stem('navigation/navbar').all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("stem" = \'navigation/navbar\') ORDER BY stem ASC',
    )
  })

  describe('.stem() input normalization', () => {
    it('strips leading slashes from user input', async () => {
      // Stored stems never carry a leading slash, so the slash from callers is
      // tolerated and stripped.
      await collectionQueryBuilder(mockCollection, mockFetch).stem('/navbar').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("stem" = \'navbar\') ORDER BY stem ASC',
      )
    })

    it('strips trailing slashes from user input', async () => {
      // A trailing slash would never match the stored stem, so collapse it silently.
      await collectionQueryBuilder(mockCollection, mockFetch).stem('navbar/').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("stem" = \'navbar\') ORDER BY stem ASC',
      )
    })

    it('strips both leading and trailing slashes', async () => {
      await collectionQueryBuilder(mockCollection, mockFetch).stem('/foo/bar/').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("stem" = \'foo/bar\') ORDER BY stem ASC',
      )
    })

    it('keeps inner slashes and trims an input of only slashes to an empty stem', async () => {
      await collectionQueryBuilder(mockCollection, mockFetch).stem('a//b').all()
      expect(mockFetch).toHaveBeenLastCalledWith('articles', 'SELECT * FROM _articles WHERE ("stem" = \'a//b\') ORDER BY stem ASC')
      await collectionQueryBuilder(mockCollection, mockFetch).stem('///').all()
      expect(mockFetch).toHaveBeenLastCalledWith('articles', 'SELECT * FROM _articles WHERE ("stem" = \'\') ORDER BY stem ASC')
    })

    it('trims a long run of inner slashes in linear time', async () => {
      const stem = `a${'/'.repeat(100_000)}b`
      const start = performance.now()
      await collectionQueryBuilder(mockCollection, mockFetch).stem(stem).all()
      expect(performance.now() - start).toBeLessThan(1000)
      expect(mockFetch).toHaveBeenLastCalledWith('articles', `SELECT * FROM _articles WHERE ("stem" = '${stem}') ORDER BY stem ASC`)
    }, 60_000)
  })

  it('count() ignores LIMIT carried over from .limit()', async () => {
    // COUNT returns a single row, so LIMIT and OFFSET must not apply to it.
    mockFetch.mockResolvedValueOnce([{ count: 42 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.limit(5).count()

    expect(result).toBe(42)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles ORDER BY stem ASC',
    )
  })

  it('count() ignores OFFSET carried over from .skip()/.limit()', async () => {
    mockFetch.mockResolvedValueOnce([{ count: 7 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.skip(10).limit(5).count()

    expect(result).toBe(7)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles ORDER BY stem ASC',
    )
  })

  it('count(field, true) ignores LIMIT/OFFSET in single-query path', async () => {
    mockFetch.mockResolvedValueOnce([{ count: 3 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.skip(2).limit(10).count('author', true)

    expect(result).toBe(3)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(DISTINCT author) as count FROM _articles ORDER BY stem ASC',
    )
  })

  describe('auto-locale detection', () => {
    it('reads the detected non-default locale and the default locale in one query', async () => {
      // `client.ts` passes the `@nuxtjs/i18n` locale as the third argument.
      await collectionQueryBuilder(mockCollection, mockFetch, 'fr').all()

      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" IN (\'fr\', \'en\')) ORDER BY stem ASC',
      )
    })

    it('does not auto-apply locale when .locale() is called explicitly', async () => {
      // Pass 'fr' as detectedLocale, but call .locale('de') explicitly
      const query = collectionQueryBuilder(mockCollection, mockFetch, 'fr')
      await query.locale('de').all()

      // Should use the explicit 'de', not auto-detected 'fr'
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'de\') ORDER BY stem ASC',
      )
    })

    it('does not auto-apply locale when no detectedLocale is provided', async () => {
      // No `detectedLocale` means no auto-locale is applied.
      const query = collectionQueryBuilder(mockCollection, mockFetch)
      await query.all()

      // Should query without locale filter
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles ORDER BY stem ASC',
      )
    })

    it('uses single query (no fallback) when detectedLocale equals defaultLocale', async () => {
      // The default locale needs no fallback, so a plain filter is enough.
      const query = collectionQueryBuilder(mockCollection, mockFetch, 'en')
      await query.all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )
    })

    it('rejects unknown detectedLocale values', async () => {
      // `'xx'` is not in `i18nConfig.locales`, so it is ignored (no locale filter
      // is added).
      const query = collectionQueryBuilder(mockCollection, mockFetch, 'xx')
      await query.all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles ORDER BY stem ASC',
      )
    })

    it('does not leak auto-locale into persistent conditions across calls', async () => {
      // The detected locale applies per call and never stacks with itself or
      // with an explicit `.locale()`.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'en')

      mockFetch.mockResolvedValueOnce([])
      // Auto-locale resolves to `en` (the default), so the single-query path runs.
      await qb.all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )

      mockFetch.mockResolvedValueOnce([])
      // The second call must not stack a duplicate locale condition.
      await qb.all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )

      // An explicit `.locale()` must fully override the auto-locale on the next call.
      mockFetch.mockResolvedValueOnce([])
      await qb.locale('de').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'de\') ORDER BY stem ASC',
      )
    })

    it('suppresses auto-locale when .where("locale", ...) is used directly', async () => {
      // A manual filter on `locale` replaces the detected locale, so the two
      // filters cannot contradict each other.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'fr')
      await qb.where('locale', '=', 'en').all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )
    })

    it('suppresses auto-locale when .andWhere() contains a locale filter', async () => {
      // A manual locale filter nested inside an `andWhere` group also replaces
      // the detected locale. Any condition on the quoted `"locale"` column counts.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'fr')
      await qb
        .andWhere(g => g.where('title', 'LIKE', '%foo%').where('locale', '=', 'en'))
        .all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const sql = mockFetch.mock.lastCall![1] as string
      // No `locale = 'fr'` from auto-detection
      expect(sql).not.toContain('"locale" = \'fr\'')
      expect(sql).toContain('"locale" = \'en\'')
    })

    it('skips auto-locale when detected locale is a BCP-47 tag not in collection.locales', async () => {
      // A collection declaring only `en` ignores the `en-US` locale and returns
      // every locale. The warning only runs in development, so only the missing
      // filter is asserted here.
      await collectionQueryBuilder(mockCollection, mockFetch, 'en-US').all()
      const sql = mockFetch.mock.lastCall![1] as string
      expect(sql).not.toContain('"locale" =')
    })

    it('does not auto-apply a locale on a collection without i18n config', async () => {
      // The `plain` collection has no `i18n` in the manifest, so a detected locale
      // must not add any filter even though the locale looks valid.
      await collectionQueryBuilder('plain' as never, mockFetch, 'fr').all()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'plain',
        'SELECT * FROM _plain ORDER BY stem ASC',
      )
    })

    it('suppresses auto-locale when a locale filter is nested inside a group', async () => {
      // A locale filter reachable only through a nested `andWhere` group must still
      // disable auto-locale, otherwise the two combine into a contradictory
      // `locale = 'fr' AND locale = 'en'` clause.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'fr')
      await qb
        .andWhere(g => g.andWhere(g2 => g2.where('locale', '=', 'en')))
        .all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const sql = mockFetch.mock.lastCall![1] as string
      expect(sql).not.toContain('"locale" = \'fr\'')
      expect(sql).toContain('"locale" = \'en\'')
    })

    it('keeps auto-locale active when a value merely contains the text "locale"', async () => {
      // A string value that contains the token `"locale"` must not be mistaken for
      // a locale-column filter, so auto-locale still applies.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'en')
      await qb.where('title', '=', 'say "locale"').all()

      const sql = mockFetch.mock.lastCall![1] as string
      expect(sql).toContain('"locale" = \'en\'')
    })
  })
})
