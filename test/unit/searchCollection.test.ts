import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildFTSIndex, queryFTS, resetFTSIndex, _resetFTSState } from '../../src/runtime/internal/search'
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
      expect(allCalls[0]!.params).toEqual(['"vue"* "composable"*', 'docs', 20])
    })

    it('should support multiple collections', async () => {
      await queryFTS(mockDb, ['docs', 'blog'], 'search term')

      expect(allCalls[0]!.sql).toContain('collection IN (?, ?)')
      expect(allCalls[0]!.params).toEqual(['"search"* "term"*', 'docs', 'blog', 20])
    })

    it('should respect limit option', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { limit: 10 })

      expect(allCalls[0]!.sql).toContain('LIMIT ?')
      expect(allCalls[0]!.params![allCalls[0]!.params!.length - 1]).toBe(10)
    })

    it('should include content snippet when requested', async () => {
      await queryFTS(mockDb, ['docs'], 'query', {
        snippet: { columns: ['content'], around: 20 },
      })

      expect(allCalls[0]!.sql).toContain('snippet(_fts_search, 5, \'<mark>\', \'</mark>\', \'...\', 20) as snippet_content')
    })

    it('should highlight title with JS regex when title snippet requested', async () => {
      mockDb.all = vi.fn(async () => [
        { collection: 'docs', id: '/test', title: 'ColorModeButton', titles: '[]', content: '', level: 1, rank: -5 },
      ])

      const results = await queryFTS(mockDb, ['docs'], 'button', {
        snippet: { columns: ['title'] },
      })

      expect(results[0]!.snippets?.title).toBe('ColorMode<mark>Button</mark>')
    })

    it('should include both title and content snippets', async () => {
      mockDb.all = vi.fn(async () => [
        { collection: 'docs', id: '/test', title: 'Avatar', titles: '[]', content: 'An avatar component', level: 1, rank: -5, snippet_content: 'An <mark>avatar</mark> component' },
      ])

      const results = await queryFTS(mockDb, ['docs'], 'avatar', {
        snippet: { columns: ['title', 'content'] },
      })

      expect(results[0]!.snippets?.title).toBe('<mark>Avatar</mark>')
      expect(results[0]!.snippets?.content).toBe('An <mark>avatar</mark> component')
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

    it('should include snippets in results when requested', async () => {
      mockDb.all = vi.fn(async () => [
        {
          collection: 'docs',
          id: '/docs/intro#setup',
          title: 'Setup',
          titles: '[]',
          content: 'Install the package with npm',
          level: 2,
          rank: -1.2,
          snippet_content: '...Install the <mark>package</mark> with npm...',
        },
      ])

      const results = await queryFTS(mockDb, ['docs'], 'package', {
        snippet: { columns: ['title', 'content'], around: 20 },
      })

      expect(results[0]!.snippets).toEqual({
        title: 'Setup',
        content: '...Install the <mark>package</mark> with npm...',
      })
    })

    it('should filter terms by minMatchCharLength', async () => {
      await queryFTS(mockDb, ['docs'], 'a vue b', { minTermLength: 2 })

      expect(allCalls[0]!.params![0]).toBe('"vue"*')
    })

    it('should return empty when all terms are below minMatchCharLength', async () => {
      const results = await queryFTS(mockDb, ['docs'], 'a b c', { minTermLength: 3 })

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
        snippet: { columns: ['content'], around: 20, tag: 'b' },
      })

      expect(allCalls[0]!.sql).toContain('\'<b>\'')
      expect(allCalls[0]!.sql).toContain('\'</b>\'')
    })

    it('should sanitize highlight tag', async () => {
      await queryFTS(mockDb, ['docs'], 'query', {
        snippet: { columns: ['content'], tag: 'script>alert(1)</script' },
      })

      expect(allCalls[0]!.sql).toContain('\'<scriptalert1script>\'')
    })

    it('should escape double quotes in query terms', async () => {
      await queryFTS(mockDb, ['docs'], 'say "hello"')

      expect(allCalls[0]!.params![0]).toBe('"say"* """hello"""*')
    })

    it('should return empty array on FTS5 syntax error', async () => {
      mockDb.all = vi.fn(async () => {
        throw new Error('fts5: syntax error')
      })

      const results = await queryFTS(mockDb, ['docs'], 'test')

      expect(results).toEqual([])
    })

    it('should use sqrt heading boost by default', async () => {
      await queryFTS(mockDb, ['docs'], 'query')

      expect(allCalls[0]!.sql).toContain('/ pow(level, 0.5))')
    })

    it('should disable level boost when heading is 0', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { weights: { heading: 0 } })

      expect(allCalls[0]!.sql).not.toContain('pow(level')
    })

    it('should use linear heading boost when heading is 1', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { weights: { heading: 1 } })

      expect(allCalls[0]!.sql).toContain('/ pow(level, 1))')
    })

    it('should use custom heading exponent', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { weights: { heading: 0.3 } })

      expect(allCalls[0]!.sql).toContain('/ pow(level, 0.3))')
    })

    it('should use custom weights', async () => {
      await queryFTS(mockDb, ['docs'], 'query', { weights: { title: 20, content: 1 } })

      expect(allCalls[0]!.sql).toContain('bm25(_fts_search, 0, 0, 20, 20, 0, 1, 0)')
    })
  })

  describe('buildFTSIndex title normalization', () => {
    it('should split camelCase titles into title_normalized column', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/docs/button',
        title: 'ColorModeButton',
        description: 'A button component',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)

      const insertParams = execCalls[1]!.params!
      expect(insertParams[2]).toBe('ColorModeButton')
      expect(insertParams[3]).toBe('Color Mode Button')
    })

    it('should keep title_normalized same as title when no camelCase', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/docs/intro',
        title: 'Introduction',
        description: '',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)

      const insertParams = execCalls[1]!.params!
      expect(insertParams[2]).toBe('Introduction')
      expect(insertParams[3]).toBe('Introduction')
    })
  })

  describe('resetFTSIndex', () => {
    it('should drop FTS table and clear state', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/test',
        title: 'Test',
        description: '',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)
      const callsBeforeReset = execCalls.length

      await resetFTSIndex(mockDb)

      expect(execCalls[callsBeforeReset]!.sql).toContain('DROP TABLE IF EXISTS _fts_search')
    })

    it('should allow rebuilding index after reset', async () => {
      const mockQueryBuilder = createMockQueryBuilder([{
        path: '/test',
        title: 'Test',
        description: '',
        body: { type: 'root', children: [] },
      }])

      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)
      await resetFTSIndex(mockDb)

      execCalls.length = 0
      await buildFTSIndex(mockDb, 'docs', mockQueryBuilder)

      expect(execCalls[0]!.sql).toContain('CREATE VIRTUAL TABLE')
      expect(execCalls[1]!.sql).toContain('INSERT')
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
