import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    articles: '_articles',
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
})
