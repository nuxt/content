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
    const list = await ctx.fetch<Array<string>>('/api/_content/list')

    assert(list.length > 0)
    assert(list.includes('content:index.md'))

    // Ignored files should be listed
    assert(list.includes('content:.dot-ignored.md') === false, 'Ignored files with `.` should not be listed')
    assert(list.includes('content:-dash-ignored.md') === false, 'Ignored files with `-` should not be listed')
  })

  test('Get contents index', async () => {
    const index = await ctx.fetch<any>('/api/_content/get/content:index.md')

    expect(index).toHaveProperty('meta.mtime')
    expect(index).toHaveProperty('body')

    expect(index.body).toMatchSnapshot('basic-index-body')
  })

  test('Get ignored contents', async () => {
    const index = await ctx.fetch<any>('/api/_content/get/content:.ignored.md')

    expect(index).not.toHaveProperty('meta.mtime')
    expect(index).toMatchObject({})
    expect(index.body).toBeNull()
  })

  test('Get navigation', async () => {
    const list = await ctx.fetch<Array<string>>('/api/_content/navigation')

    expect(list).toMatchSnapshot('basic-navigation')
  })

  test('Get cats navigation', async () => {
    const list = await ctx.fetch<Array<string>>('/api/_content/navigation', {
      method: 'POST',
      body: {
        slug: '/cats'
      }
    })

    expect(list).toMatchSnapshot('basic-navigation-cats')
  })

  test('Get cats navigation', async () => {
    const list = await ctx.fetch<Array<string>>('/api/_content/navigation', {
      method: 'POST',
      body: {
        slug: '/dogs'
      }
    })

    expect(list).toMatchSnapshot('basic-navigation-dogs')
  })
})
