import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assertSafeQuery } from '../../src/runtime/internal/security'
import { collectionQueryBuilder } from '../../src/runtime/internal/query'

// Mock tables from manifest
vi.mock('#content/manifest', () => ({
  tables: {
    test: '_content_test',
  },
}))
const mockFetch = vi.fn().mockResolvedValue(Promise.resolve([{}]))
const mockCollection = 'test' as never

describe('decompressSQLDump', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  const queries = {
    'SELECT * FROM sqlite_master': false,
    'INSERT INTO _test VALUES (\'abc\')': false,
    'CREATE TABLE _test (id TEXT PRIMARY KEY)': false,
    'select * from _content_test ORDER BY id DESC': false,
    ' SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC ': false,
    'SELECT * FROM _content_test ORDER BY id DESC': true,
    'SELECT * FROM _content_test ORDER BY id ASC,stem DESC': false,
    'SELECT * FROM _content_test ORDER BY id ASC, stem DESC': true,
    'SELECT * FROM _content_test ORDER BY id DESC -- comment is not allowed': false,
    'SELECT * FROM _content_test ORDER BY id DESC; SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10': true,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10 OFFSET 10': true,
    // Where clause should follow query builder syntax
    'SELECT * FROM _content_test WHERE id = 1 ORDER BY id DESC LIMIT 10 OFFSET 10': false,
    'SELECT * FROM _content_test WHERE (id = 1) ORDER BY id DESC LIMIT 10 OFFSET 10': true,
    'SELECT * FROM _content_test WHERE (id = \'");\'); select * from ((SELECT * FROM sqlite_master where 1 <> "") as t) ORDER BY type DESC': false,
  }

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

  it('throws error if query is not valid', async () => {
    await collectionQueryBuilder(mockCollection, mockFetch).all()
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