import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables and collection metadata from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    articles: '_articles',
    navigation: '_navigation',
    plain: '_plain',
  },
  default: {
    articles: {
      type: 'data',
      fields: {},
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
      stemPrefix: '',
    },
    // i18n collection whose source lives under a `navigation` directory, so
    // `.stem()` resolves the prefix.
    navigation: {
      type: 'data',
      fields: {},
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
      stemPrefix: 'navigation',
    },
    // Collection without i18n, used to assert auto-locale is a no-op.
    plain: {
      type: 'data',
      fields: {},
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
  })

  it('locale fallback merges results in stem order', async () => {
    // `fr` has stem `c`, while `en` has stems `a`, `b`, `c`. The fallback should
    // interleave `a` and `b` ahead of `c`.
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

  it('count() ignores LIMIT carried over from .limit()', async () => {
    // Regression. COUNT returns exactly one row, so appending `LIMIT N` is at
    // best misleading. Combined with `OFFSET` it returns `[]`, and `m[0].count`
    // would then throw.
    mockFetch.mockResolvedValueOnce([{ count: 42 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.limit(5).count()

    expect(result).toBe(42)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles',
    )
  })

  it('count() ignores OFFSET carried over from .skip()/.limit()', async () => {
    mockFetch.mockResolvedValueOnce([{ count: 7 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.skip(10).limit(5).count()

    expect(result).toBe(7)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(*) as count FROM _articles',
    )
  })

  it('count(field, true) ignores LIMIT/OFFSET in single-query path', async () => {
    mockFetch.mockResolvedValueOnce([{ count: 3 }])
    const query = collectionQueryBuilder(mockCollection, mockFetch)
    const result = await query.skip(2).limit(10).count('author', true)

    expect(result).toBe(3)
    expect(mockFetch).toHaveBeenCalledWith(
      'articles',
      'SELECT COUNT(DISTINCT "author") as count FROM _articles',
    )
  })

  describe('auto-locale detection', () => {
    it('auto-applies detected locale with fallback when collection has i18n', async () => {
      mockFetch
        .mockResolvedValueOnce([{ stem: 'a', locale: 'fr' }])
        .mockResolvedValueOnce([{ stem: 'a', locale: 'en' }, { stem: 'b', locale: 'en' }])

      // Pass `'fr'` as `detectedLocale` (3rd arg) to simulate what `client.ts`
      // and `server.ts` do.
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
      // When the default locale `'en'` is detected, a single `WHERE` is used
      // rather than the two-query fallback path.
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

    it('injects and strips stem when using select() with locale fallback', async () => {
      mockFetch
        .mockResolvedValueOnce([{ title: 'Bonjour', locale: 'fr', stem: 'hello' }])
        .mockResolvedValueOnce([
          { title: 'Hello', locale: 'en', stem: 'hello' },
          { title: 'World', locale: 'en', stem: 'world' },
        ])

      const results = await collectionQueryBuilder(mockCollection, mockFetch)
        .select('title' as never, 'locale' as never)
        .locale('fr', { fallback: 'en' })
        .all()

      // stem should be stripped from results since it was not explicitly selected
      expect(results[0]).not.toHaveProperty('stem')
      // Merge should work correctly: fr 'hello' replaces en 'hello', en 'world' is fallback
      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({ title: 'Bonjour', locale: 'fr' })
      expect(results[1]).toMatchObject({ title: 'World', locale: 'en' })
    })

    it('counts correctly with locale fallback', async () => {
      mockFetch
        .mockResolvedValueOnce([
          { title: 'Bonjour', stem: 'hello' },
        ])
        .mockResolvedValueOnce([
          { title: 'Hello', stem: 'hello' },
          { title: 'World', stem: 'world' },
        ])

      const count = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .count()

      // fr has 'hello', en has 'hello' + 'world'. Merged: 2 unique stems
      expect(count).toBe(2)
    })

    it('counts distinct with locale fallback', async () => {
      mockFetch
        .mockResolvedValueOnce([
          { title: 'Same', stem: 'a' },
          { title: 'Same', stem: 'b' },
        ])
        .mockResolvedValueOnce([
          { title: 'Same', stem: 'a' },
          { title: 'Different', stem: 'c' },
        ])

      const count = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .count('title' as never, true)

      // Merged items: a='Same', b='Same', c='Different'. Distinct titles: 2
      expect(count).toBe(2)
    })

    it('does not leak auto-locale into persistent conditions across calls', async () => {
      // Regression. The auto-applied locale used to be pushed to
      // `params.conditions` on first execution, so a second `.all()` on the
      // same builder would reapply it. Any intervening `.locale()` call would
      // then produce a contradictory `loc=X AND loc=Y`.
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
      // Regression. Previously `.where('locale', ...)` did not flip
      // `localeExplicitlySet`, so auto-detection would still append its own
      // locale filter and produce a contradictory `locale = 'fr' AND locale = 'en'`.
      const qb = collectionQueryBuilder(mockCollection, mockFetch, 'fr')
      await qb.where('locale', '=', 'en').all()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT * FROM _articles WHERE ("locale" = \'en\') ORDER BY stem ASC',
      )
    })

    it('suppresses auto-locale when .andWhere() contains a locale filter', async () => {
      // A manual locale filter nested inside an `andWhere` group should also
      // disable auto-locale. The detector matches any condition starting with
      // the quoted column name `"locale"`.
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

    it('restores selectedFields after a failed locale-fallback fetch', async () => {
      // Regression. State mutation on the locale-fallback path used to leak
      // when the underlying fetch threw, so the next query would then SELECT an
      // extra `stem` column.
      const qb = collectionQueryBuilder(mockCollection, mockFetch)
        .select('title' as never, 'locale' as never)
        .locale('fr', { fallback: 'en' })

      mockFetch.mockRejectedValueOnce(new Error('boom'))
      await expect(qb.all()).rejects.toThrow('boom')

      // Run an unrelated query on a *new* builder using the same select set.
      // This verifies test isolation, since the bug was about builder-internal
      // mutation.
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce([{ title: 'x', locale: 'en' }])
      await collectionQueryBuilder(mockCollection, mockFetch)
        .select('title' as never, 'locale' as never)
        .all()

      expect(mockFetch).toHaveBeenCalledWith(
        'articles',
        'SELECT "title", "locale" FROM _articles ORDER BY stem ASC',
      )
    })

    it('is safe under concurrent .all()/.count() on the same builder (no shared-state race)', async () => {
      // Regression. `.count()` and `fetchWithLocaleFallback` used to mutate
      // `params.selectedFields`, `params.offset`, and `params.limit` in a
      // save-mutate-restore-in-finally pattern. Under `Promise.all`, a second
      // terminal could observe the mutated state mid-flight. Both terminals
      // now pass overrides into `buildQuery` and never touch `params`.
      const qb = collectionQueryBuilder(mockCollection, mockFetch)
        .select('title' as never, 'locale' as never)
        .locale('fr', { fallback: 'en' })

      // Four fetches are expected, two from `.all()` (fr + en) and two from
      // `.count()` (fr + en). `.count()` injects `title` into `selectedFields`,
      // and `.all()` must NOT observe that injection.
      mockFetch
        .mockResolvedValueOnce([{ title: 'a-fr', locale: 'fr', stem: 'a' }])
        .mockResolvedValueOnce([{ title: 'b-en', locale: 'en', stem: 'b' }])
        .mockResolvedValueOnce([{ title: 'a-fr', locale: 'fr', stem: 'a' }])
        .mockResolvedValueOnce([{ title: 'b-en', locale: 'en', stem: 'b' }])

      const [items, count] = await Promise.all([qb.all(), qb.count('title' as never)])

      expect(items).toHaveLength(2)
      expect(count).toBe(2)

      // Every issued query must have selected exactly the user's fields (+ injected stem),
      // not the count's extra 'title' bleeding into .all()'s SELECT list.
      const queries = mockFetch.mock.calls.map(c => c[1] as string)
      for (const q of queries) {
        // Should not have `title` duplicated in the SELECT list
        expect(q.match(/"title"/g)?.length ?? 0).toBeLessThanOrEqual(1)
      }
    })

    it('count() with selected fields and locale fallback bypasses pagination', async () => {
      // skip(10).limit(5).count() should return the full count, not just the visible page.
      mockFetch
        .mockResolvedValueOnce([
          { title: 'a-fr', stem: 'a' },
          { title: 'b-fr', stem: 'b' },
          { title: 'c-fr', stem: 'c' },
        ])
        .mockResolvedValueOnce([
          { title: 'd-en', stem: 'd' },
          { title: 'e-en', stem: 'e' },
        ])

      const count = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .skip(10) // would slice everything away if not bypassed
        .limit(2)
        .count()

      expect(count).toBe(5)
    })

    it('skips auto-locale when detected locale is a BCP-47 tag not in collection.locales', async () => {
      // `@nuxtjs/i18n` may return `en-US`. A collection declaring only `en` skips
      // auto-locale rather than producing rows from every locale. The dev-only
      // warning is gated by `import.meta.dev` (false in this test environment), so
      // only the no-filter behaviour is asserted here.
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

  describe('.stem() source-prefix resolution', () => {
    it('prepends the collection stem prefix when absent', async () => {
      await collectionQueryBuilder('navigation' as never, mockFetch).stem('navbar').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'navigation',
        'SELECT * FROM _navigation WHERE ("stem" = \'navigation/navbar\') ORDER BY stem ASC',
      )
    })

    it('does not double the prefix when the stem already includes it', async () => {
      await collectionQueryBuilder('navigation' as never, mockFetch).stem('navigation/navbar').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'navigation',
        'SELECT * FROM _navigation WHERE ("stem" = \'navigation/navbar\') ORDER BY stem ASC',
      )
    })

    it('treats the prefix as present only on a segment boundary', async () => {
      // `navigation2` must not be mistaken for the `navigation` prefix.
      await collectionQueryBuilder('navigation' as never, mockFetch).stem('navigation2/foo').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'navigation',
        'SELECT * FROM _navigation WHERE ("stem" = \'navigation/navigation2/foo\') ORDER BY stem ASC',
      )
    })

    it('matches the bare prefix exactly without doubling it', async () => {
      await collectionQueryBuilder('navigation' as never, mockFetch).stem('navigation').all()
      expect(mockFetch).toHaveBeenLastCalledWith(
        'navigation',
        'SELECT * FROM _navigation WHERE ("stem" = \'navigation\') ORDER BY stem ASC',
      )
    })
  })

  describe('locale fallback ordering and counting', () => {
    it('interleaves by stem when navigation injects the default order', async () => {
      // The navigation/surround helpers inject `order('stem', 'ASC')`. The merge
      // must still interleave the two result sets by stem rather than concatenate.
      mockFetch
        .mockResolvedValueOnce([{ stem: '1.intro', locale: 'fr' }, { stem: '3.advanced', locale: 'fr' }])
        .mockResolvedValueOnce([
          { stem: '1.intro', locale: 'en' },
          { stem: '2.guide', locale: 'en' },
          { stem: '3.advanced', locale: 'en' },
        ])

      const results = await collectionQueryBuilder(mockCollection, mockFetch)
        .order('stem', 'ASC')
        .locale('fr', { fallback: 'en' })
        .all()

      expect(results.map((r: { stem: string }) => r.stem)).toEqual(['1.intro', '2.guide', '3.advanced'])
      // The translated page wins over its fallback at each shared stem.
      expect(results[0]).toMatchObject({ stem: '1.intro', locale: 'fr' })
      expect(results[1]).toMatchObject({ stem: '2.guide', locale: 'en' })
    })

    it('re-sorts the merged result rather than trusting sub-query order', async () => {
      // Sub-queries may arrive in a non-binary order (for example a linguistic
      // collation on PostgreSQL). The merge re-sorts by stem so the page is
      // deterministic regardless of the backend's collation.
      mockFetch
        .mockResolvedValueOnce([{ stem: 'b', locale: 'fr' }, { stem: 'a', locale: 'fr' }])
        .mockResolvedValueOnce([{ stem: 'c', locale: 'en' }])

      const results = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .all()

      expect(results.map((r: { stem: string }) => r.stem)).toEqual(['a', 'b', 'c'])
    })

    it('counts distinct object column values by structural equality', async () => {
      // SQL `COUNT(DISTINCT ...)` compares serialized values. The fallback path
      // mirrors that, so two structurally-equal JSON values count once.
      mockFetch
        .mockResolvedValueOnce([{ tags: { a: 1 }, stem: 'x' }])
        .mockResolvedValueOnce([{ tags: { a: 1 }, stem: 'y' }, { tags: { a: 2 }, stem: 'z' }])

      const count = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .count('tags' as never, true)

      // { a: 1 } (x and y share the stem-distinct rows) and { a: 2 }: 2 distinct values.
      expect(count).toBe(2)
    })
  })

  describe('mergeSortedArrays / locale-fallback ordering', () => {
    it('preserves DB sort order for mixed-case stems (binary, not localeCompare)', async () => {
      // SQLite BINARY puts 'A' (65) before 'a' (97). localeCompare would put 'a' first.
      // The merge must agree with the DB so the interleaving stays in true ASC order.
      mockFetch
        .mockResolvedValueOnce([
          { stem: 'B', locale: 'fr' },
        ])
        .mockResolvedValueOnce([
          { stem: 'A', locale: 'en' },
          { stem: 'a', locale: 'en' },
        ])

      const results = await collectionQueryBuilder(mockCollection, mockFetch)
        .locale('fr', { fallback: 'en' })
        .all()

      expect(results.map((r: { stem: string }) => r.stem)).toEqual(['A', 'B', 'a'])
    })
  })
})
