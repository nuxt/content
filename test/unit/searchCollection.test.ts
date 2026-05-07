import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildFTSIndex, queryFTS, _resetFTSState } from '../../src/runtime/internal/search'
import type { CollectionQueryBuilder, DatabaseAdapter, PageCollectionItemBase } from '../../src/types'

describe('searchCollection FTS5', () => {
  let mockDb: DatabaseAdapter
  let execCalls: Array<{ sql: string, params?: unknown[] }>
  let allCalls: Array<{ sql: string, params?: unknown[] }>

  beforeEach(() => {
    _resetFTSState()
    execCalls = []
    allCalls = []
    mockDb = {
      exec: vi.fn(async (sql: string, params?: unknown[]) => {
        execCalls.push({ sql, params })
      }),
      all: vi.fn(async (sql: string, params?: unknown[]) => {
        allCalls.push({ sql, params })
        return []
      }),
      first: vi.fn(async () => null),
    }
  })

  describe('buildFTSIndex', () => {
    it('should create FTS5 table and insert sections', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/docs/intro',
        title: 'Introduction',
        description: 'Getting started guide',
        body: {
          type: 'root',
          children: [
            {
              type: 'element',
              tag: 'h2',
              props: { id: 'setup' },
              children: [{ type: 'text', value: 'Setup' }],
            },
            {
              type: 'element',
              tag: 'p',
              children: [{ type: 'text', value: 'Install the package' }],
            },
          ],
        },
      }])

      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)

      expect(execCalls[0]!.sql).toContain('CREATE VIRTUAL TABLE IF NOT EXISTS _fts_search USING fts5')
      expect(execCalls[0]!.sql).toContain('collection UNINDEXED')
      expect(execCalls[0]!.sql).toContain('id UNINDEXED')
      expect(execCalls[0]!.sql).toContain('level UNINDEXED')

      // First section (page-level)
      expect(execCalls[1]!.params).toEqual([
        'docs',
        '/docs/intro',
        'Introduction',
        'Introduction',
        '[]',
        'Getting started guide',
        1,
      ])

      // Second section (h2)
      expect(execCalls[2]!.params).toEqual([
        'docs',
        '/docs/intro#setup',
        'Setup',
        'Setup',
        '["Introduction"]',
        'Install the package',
        2,
      ])
    })

    it('should not rebuild index for already-indexed collection', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/test',
        title: 'Test',
        description: '',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'blog', mockQueryBuilder)
      const callsAfterFirst = execCalls.length

      await buildFTSIndex(mockDb, 'blog', mockQueryBuilder)

      expect(execCalls.length).toBe(callsAfterFirst)
    })

    it('should allow indexing multiple collections into the same table', async () => {
      const docsQb = createMockQueryBuilder([{
        path: '/docs/page',
        title: 'Docs Page',
        description: 'Docs content',
        body: { type: 'root', children: [] },
      }])

      const blogQb = createMockQueryBuilder([{
        path: '/blog/post',
        title: 'Blog Post',
        description: 'Blog content',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'multi-docs', docsQb)
      await buildFTSIndex(mockDb, 'multi-blog', blogQb)

      const insertCalls = execCalls.filter(c => c.sql.includes('INSERT'))
      const collections = insertCalls.map(c => c.params?.[0])
      expect(collections).toContain('multi-docs')
      expect(collections).toContain('multi-blog')
    })
  })

  describe('queryFTS', () => {
    it('should build correct MATCH query with collection filter', async () => {
      await queryFTS(mockDb, ['docs'], 'vue composable')

      expect(allCalls[0]!.sql).toContain('FROM _fts_search')
      expect(allCalls[0]!.sql).toContain('_fts_search MATCH ?')
      expect(allCalls[0]!.sql).toContain('collection IN (?)')
      expect(allCalls[0]!.sql).toContain('ORDER BY rank')
      expect(allCalls[0]!.params).toEqual(['"vue"* "composable"*', 'docs', 50])
    })

    it('should support multiple collections', async () => {
      await queryFTS(mockDb, ['docs', 'blog'], 'search term')

      expect(allCalls[0]!.sql).toContain('collection IN (?, ?)')
      expect(allCalls[0]!.params).toEqual(['"search"* "term"*', 'docs', 'blog', 50])
    })

    it('should respect limit option', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { limit: 10 })

      expect(allCalls[0]!.sql).toContain('LIMIT ?')
      expect(allCalls[0]!.params![allCalls[0]!.params!.length - 1]).toBe(10)
    })

    it('should include snippet when requested', async () => {
      await queryFTS(mockDb, ['docs'], 'query', {
        snippet: { column: 'content', around: 20 },
      })

      expect(allCalls[0]!.sql).toContain('snippet(_fts_search, 5, \'<mark>\', \'</mark>\', \'...\', 20)')
    })

    it('should use title column index for snippet when specified', async () => {
      await queryFTS(mockDb, ['docs'], 'query', {
        snippet: { column: 'title', around: 15 },
      })

      expect(allCalls[0]!.sql).toContain('snippet(_fts_search, 2, \'<mark>\', \'</mark>\', \'...\', 15)')
    })

    it('should parse results correctly', async () => {
      mockDb.all = vi.fn(async () => [
        {
          collection: 'docs',
          id: '/docs/intro#setup',
          title: 'Setup',
          titles: '["Introduction"]',
          content: 'Install the package',
          level: 2,
          rank: -1.5,
        },
      ])

      const results = await queryFTS(mockDb, ['docs'], 'setup')

      expect(results).toEqual([{
        collection: 'docs',
        id: '/docs/intro#setup',
        title: 'Setup',
        titles: ['Introduction'],
        content: 'Install the package',
        level: 2,
        rank: -1.5,
      }])
    })

    it('should include snippet in results when requested', async () => {
      mockDb.all = vi.fn(async () => [
        {
          collection: 'docs',
          id: '/docs/intro#setup',
          title: 'Setup',
          titles: '[]',
          content: 'Install the package with npm',
          level: 2,
          rank: -1.2,
          snippet: '...Install the <mark>package</mark> with npm...',
        },
      ])

      const results = await queryFTS(mockDb, ['docs'], 'package', {
        snippet: { column: 'content', around: 20 },
      })

      expect(results[0]!.snippet).toBe('...Install the <mark>package</mark> with npm...')
    })

    it('should filter terms by minMatchCharLength', async () => {
      await queryFTS(mockDb, ['docs'], 'a vue b', { minMatchCharLength: 2 })

      expect(allCalls[0]!.params![0]).toBe('"vue"*')
    })

    it('should return empty when all terms are below minMatchCharLength', async () => {
      const results = await queryFTS(mockDb, ['docs'], 'a b c', { minMatchCharLength: 3 })

      expect(results).toEqual([])
      expect(allCalls.length).toBe(0)
    })

    it('should restrict search to specific fields', async () => {
      await queryFTS(mockDb, ['docs'], 'setup', { fields: ['title'] })

      expect(allCalls[0]!.params![0]).toBe('title : "setup"*')
    })

    it('should support multiple fields with OR', async () => {
      await queryFTS(mockDb, ['docs'], 'setup', { fields: ['title', 'content'] })

      expect(allCalls[0]!.params![0]).toBe('title : "setup"* OR content : "setup"*')
    })

    it('should use custom highlight tag', async () => {
      await queryFTS(mockDb, ['docs'], 'query', {
        snippet: { column: 'content', around: 20, tag: 'b' },
      })

      expect(allCalls[0]!.sql).toContain('\'<b>\'')
      expect(allCalls[0]!.sql).toContain('\'</b>\'')
    })
  })
})

function createMockQueryBuilder(result: unknown[]) {
  const mockQueryBuilder = {
    where: () => mockQueryBuilder,
    select: () => mockQueryBuilder,
    all: async () => result,
  } as unknown as CollectionQueryBuilder<PageCollectionItemBase>

  return mockQueryBuilder
}
