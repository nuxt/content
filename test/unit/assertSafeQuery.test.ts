import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assertSafeQuery } from '../../src/runtime/internal/security'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables and collection metadata from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    test: '_content_test',
  },
  default: {
    test: { type: 'data', fields: {} },
  },
}))
const mockFetch = vi.fn().mockResolvedValue(Promise.resolve([{}]))
const mockCollection = 'test' as never

describe('decompressSQLDump', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  const queries = {
    '': false,
    'SELECT * FROM sqlite_master': false,
    'INSERT INTO _test VALUES (\'abc\')': false,
    'CREATE TABLE _test (id TEXT PRIMARY KEY)': false,
    'select * from _content_test ORDER BY id DESC': false,
    ' SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC ': false,
    'SELECT * FROM _content_test ORDER BY id DESC': true,
    'SELECT * FROM _content_test ORDER BY id ASC,stem DESC': false,
    'SELECT * FROM _content_test ORDER BY id ASC, stem DESC': true,
    'SELECT * FROM _content_test ORDER BY id ASC, publishedAt DESC': true,
    'SELECT "PublishedAt" FROM _content_test ORDER BY id ASC, PublishedAt DESC': true,
    'SELECT * FROM _content_test ORDER BY id DESC -- comment is not allowed': false,
    'SELECT * FROM _content_test ORDER BY id DESC; SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10': true,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10 OFFSET 10': true,
    // Where clause should follow query builder syntax
    'SELECT * FROM _content_test WHERE id = 1 ORDER BY id DESC LIMIT 10 OFFSET 10': false,
    'SELECT * FROM _content_test WHERE (id = 1) ORDER BY id DESC LIMIT 10 OFFSET 10': true,
    'SELECT * FROM _content_test WHERE (id = \'");\'); select * from ((SELECT * FROM sqlite_master where 1 <> "") as t) ORDER BY type DESC': false,
    'SELECT "body" FROM _content_test ORDER BY body ASC': true,
    // Advanced
    'SELECT COUNT(*) UNION SELECT name /**/FROM sqlite_master-- FROM _content_test WHERE (1=1) ORDER BY id ASC': false,
    'SELECT * FROM _content_test WHERE (id /*\'*/IN (SELECT id FROM _content_test) /*\'*/) ORDER BY id ASC': false,
    'SELECT * FROM _content_test WHERE (1=\' \\\' OR id IN (SELECT id FROM _content_docs) OR 1!=\'\') ORDER BY id ASC': false,
    'SELECT "id", "id" FROM _content_docs WHERE (1=\' \\\') UNION SELECT tbl_name,tbl_name FROM sqlite_master-- \') ORDER BY id ASC': false,
    'SELECT "id" FROM _content_test WHERE (x=$\'$ OR x IN (SELECT BLAH) OR x=$\'$) ORDER BY id ASC': false,
  }

  const securityQueries = {
    // Newline injection
    'SELECT * FROM _content_test ORDER BY id ASC\nDROP TABLE _content_test': false,
    'SELECT * FROM _content_test ORDER BY id ASC\rDROP TABLE _content_test': false,
    // Escaped quotes in WHERE values should pass (not be treated as comments)
    'SELECT * FROM _content_test WHERE ("title" = \'L\'\'été\') ORDER BY stem ASC': true,
    'SELECT * FROM _content_test WHERE ("title" = \'it\'\'s\') ORDER BY stem ASC': true,
    // Triple-quote edge case — should NOT bypass keyword detection
    'SELECT * FROM _content_test WHERE ("x" = \'a\'\'\') UNION SELECT 1 ORDER BY stem ASC': false,
    // COUNT with quoted field
    'SELECT COUNT("title") as count FROM _content_test': true,
    'SELECT COUNT(DISTINCT "author") as count FROM _content_test': true,
    // COUNT without ORDER BY
    'SELECT COUNT(*) as count FROM _content_test': true,
    // Locale-filtered query (typical auto-locale output)
    'SELECT * FROM _content_test WHERE ("locale" = \'fr\') ORDER BY stem ASC': true,
    'SELECT * FROM _content_test WHERE ("locale" = \'fr\') AND ("stem" = \'navbar\') ORDER BY stem ASC': true,
  }

  Object.entries(securityQueries).forEach(([query, isValid]) => {
    it(`security: ${query.slice(0, 60)}...`, () => {
      if (isValid) {
        expect(() => assertSafeQuery(query, 'test')).not.toThrow()
      }
      else {
        expect(() => assertSafeQuery(query, 'test')).toThrow()
      }
    })
  })

  Object.entries(queries).forEach(([query, isValid]) => {
    it(`${query}`, () => {
      if (isValid) {
        expect(() => assertSafeQuery(query, 'test')).not.toThrow()
      }
      else {
        expect(() => assertSafeQuery(query, 'test')).toThrow()
      }
    })
  })

  it('all queries should be valid', async () => {
    await collectionQueryBuilder(mockCollection, mockFetch).all()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).count()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).count('stem')
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).count('stem', true)
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).order('stem', 'DESC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch).order('stem', 'DESC').order('id', 'ASC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch)
      .select('stem', 'id', 'title')
      .order('stem', 'DESC').order('id', 'ASC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch)
      .select('stem', 'id', 'title')
      .limit(10)
      .andWhere(group => group.where('id', '=', 1).where('stem', '=', 'abc'))
      .order('stem', 'DESC').order('id', 'ASC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch)
      .select('stem', 'id', 'title')
      .limit(10)
      .andWhere(group => group.where('id', '=', 1).where('stem', '=', 'abc'))
      .orWhere(group => group.where('id', '=', 2).where('stem', '=', 'def'))
      .order('stem', 'DESC').order('id', 'ASC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()

    await collectionQueryBuilder(mockCollection, mockFetch)
      .select('stem', 'id', 'title')
      .limit(10)
      .andWhere(group => group.where('id', '=', 1).where('stem', '=', 'abc'))
      .orWhere(group => group.where('id', '=', 2).where('stem', '=', 'def'))
      .andWhere(group => group.where('id', '=', 3).orWhere(g => g.where('stem', '=', 'ghi')))
      .order('stem', 'DESC').order('id', 'ASC').first()
    expect(() => assertSafeQuery(mockFetch.mock.lastCall![1], mockCollection)).not.toThrow()
  })
})
