import { describe, it, expect } from 'vitest'
import { assertSafeQuery } from '../../src/runtime/internal/security'

describe('decompressSQLDump', () => {
  const queries = {
    'SELECT * FROM sqlite_master': false,
    'INSERT INTO _test VALUES (\'abc\')': false,
    'CREATE TABLE _test (id TEXT PRIMARY KEY)': false,
    'select * from _content_test ORDER BY id DESC': false,
    ' SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC ': false,
    'SELECT * FROM _content_test ORDER BY id DESC': true,
    'SELECT * FROM _content_test ORDER BY id,stem DESC': false,
    'SELECT * FROM _content_test ORDER BY id, stem DESC': true,
    'SELECT * FROM _content_test ORDER BY id DESC -- comment is not allowed': false,
    'SELECT * FROM _content_test ORDER BY id DESC; SELECT * FROM _content_test ORDER BY id DESC': false,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10': true,
    'SELECT * FROM _content_test ORDER BY id DESC LIMIT 10 OFFSET 10': true,
    // Where clause should follow query builder syntax
    'SELECT * FROM _content_test WHERE id = 1 ORDER BY id DESC LIMIT 10 OFFSET 10': false,
    'SELECT * FROM _content_test WHERE (id = 1) ORDER BY id DESC LIMIT 10 OFFSET 10': true,
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
})
