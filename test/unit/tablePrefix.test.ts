import { describe, it, expect } from 'vitest'
import { DEFAULT_TABLE_PREFIX, defineCollection, getTableName, resolveCollections, resolveTablePrefix } from '../../src/utils/collection'

describe('tablePrefix', () => {
  it('defaults to `_content_`', () => {
    expect(resolveTablePrefix()).toBe(DEFAULT_TABLE_PREFIX)
    expect(resolveTablePrefix('')).toBe(DEFAULT_TABLE_PREFIX)
    expect(getTableName('docs')).toBe('_content_docs')
  })

  it('accepts identifier-like prefixes', () => {
    expect(resolveTablePrefix('_preview_feat_foo_')).toBe('_preview_feat_foo_')
    expect(resolveTablePrefix('site2_')).toBe('site2_')
  })

  it.each(['feat/foo_', 'my-site_', '2site_', 'site_; DROP TABLE x;', 'with space_'])('rejects "%s"', (prefix) => {
    expect(() => resolveTablePrefix(prefix)).toThrow('Invalid `tablePrefix`')
  })

  it('prefixes every collection table, info included', () => {
    const collections = resolveCollections({
      docs: defineCollection({ type: 'page', source: '**' }),
      authors: defineCollection({ type: 'data', source: 'authors/*.yml' }),
    }, { tablePrefix: '_preview_main_' })

    expect(Object.fromEntries(collections.map(c => [c.name, c.tableName]))).toEqual({
      docs: '_preview_main_docs',
      authors: '_preview_main_authors',
      info: '_preview_main_info',
    })
  })

  it('keeps the default table names without a prefix', () => {
    const collections = resolveCollections({
      docs: defineCollection({ type: 'page', source: '**' }),
    })

    expect(collections.map(c => c.tableName)).toEqual(['_content_docs', '_content_info'])
  })
})
