import { assert, test, describe, expect, afterAll } from 'vitest'
import { setupTest } from '../setup'

describe('Basic tests', () => {
  const ctx = setupTest({
    fixture: 'basic',
    server: true
  })

  afterAll(ctx._destroy)

  test('Build', ctx._init, 0)

  test('List contents', async () => {
    const list = await ctx.fetch<Array<string>>('/api/_docus/list')

    assert(list.length > 0)
    assert(list.includes('content:index.md'))
  })

  test('Get contents index', async () => {
    const index = await ctx.fetch<any>('/api/_docus/get/content:index.md')

    expect(index).toHaveProperty('meta.mtime')
    expect(index).toHaveProperty('body')

    expect(index.body).toContain('# Index')
  })
})
