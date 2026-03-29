import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables and collection metadata from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    articles: '_articles',
  },
  default: {
    articles: {
      type: 'data',
      fields: {},
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
      stemPrefix: '',
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

  it('builds count query without ORDER BY', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.count()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles',
    )
  })

  it('builds distinct count query without ORDER BY', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.count('author', true)

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(DISTINCT "author") as count FROM _articles',
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

  it('builds query with locale and fallback (two queries, sorted by stem)', async () => {
    mockFetch
      .mockResolvedValueOnce([{ stem: 'post-c', locale: 'fr' }])
      .mockResolvedValueOnce([{ stem: 'post-a', locale: 'en' }, { stem: 'post-c', locale: 'en' }])

    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const results = await query
      .locale('fr', { fallback: 'en' })
      .all()

    // Should have called fetch twice: once for locale, once for fallback
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("locale" = \'fr\') ORDER BY stem ASC',
    )
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
    )

    // Merged results: fr preferred over en duplicate, sorted by stem
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ stem: 'post-a', locale: 'en' }) // fallback, sorted first
    expect(results[1]).toEqual({ stem: 'post-c', locale: 'fr' }) // locale preferred over en
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

  it('.stem() queries by stem directly when no source prefix', async () => {
    // stemPrefix is '' (no source subdirectory), so 'navbar' stays 'navbar'
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.stem('navbar').all()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT * FROM _articles WHERE ("stem" = \'navbar\') ORDER BY stem ASC',
    )
  })

  it('locale fallback merges results in stem order', async () => {
    // fr has stem c, en has stems a, b, c — fallback should interleave a, b
    mockFetch
      .mockResolvedValueOnce([{ stem: 'c', locale: 'fr' }])
      .mockResolvedValueOnce([{ stem: 'a', locale: 'en' }, { stem: 'b', locale: 'en' }, { stem: 'c', locale: 'en' }])

    const results = await collectionQueryBuilder(mockCollection, mockFetch)
      .locale('fr', { fallback: 'en' })
      .all()

    expect(results).toHaveLength(3)
    expect(results.map((r: { stem: string }) => r.stem)).toEqual(['a', 'b', 'c'])
    // stem 'c' should come from fr (locale preferred)
    expect(results[2]).toEqual({ stem: 'c', locale: 'fr' })
    // stems 'a' and 'b' come from en (fallback)
    expect(results[0]).toEqual({ stem: 'a', locale: 'en' })
    expect(results[1]).toEqual({ stem: 'b', locale: 'en' })
  })

  it('count query omits ORDER BY', async () => {
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    await query.count()

    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles',
    )
  })

  describe('auto-locale detection', () => {
    it('auto-applies detected locale with fallback when collection has i18n', async () => {
      mockFetch
        .mockResolvedValueOnce([{ stem: 'a', locale: 'fr' }])
        .mockResolvedValueOnce([{ stem: 'a', locale: 'en' }, { stem: 'b', locale: 'en' }])

      // Pass 'fr' as detectedLocale (3rd arg) — simulates what client.ts/server.ts do
      const results = await collectionQueryBuilder(mockCollection, mockFetch, 'fr').all()

      // Should auto-apply locale with fallback to defaultLocale ('en')
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'fr\') ORDER BY stem ASC',
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )
      expect(results).toHaveLength(2)
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
      // No detectedLocale (undefined) — no auto-locale
      const query = collectionQueryBuilder(mockCollection, mockFetch)
      await query.all()

      // Should query without locale filter
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles ORDER BY stem ASC',
      )
    })

    it('uses single query (no fallback) when detectedLocale equals defaultLocale', async () => {
      // Default locale 'en' — should use a single WHERE, not two-query fallback
      const query = collectionQueryBuilder(mockCollection, mockFetch, 'en')
      await query.all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )
    })
  })
})
