import { fileURLToPath } from 'url'
import { assert, test, describe, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('fixtures:basic', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true
  })

  test('List contents', async () => {
    const list = await $fetch('/api/_content/list')

    assert(list.length > 0)
    assert(list.includes('content:index.md'))

    // Ignored files should be listed
    assert(list.includes('content:.dot-ignored.md') === false, 'Ignored files with `.` should not be listed')
    assert(list.includes('content:-dash-ignored.md') === false, 'Ignored files with `-` should not be listed')

    assert(list.includes('fa-ir:fa:index.md') === true, 'Files with `fa-ir` prefix should be listed')
  })

  test('Get contents index', async () => {
    const index = await $fetch('/api/_content/get/content:index.md')

    expect(index).toHaveProperty('meta.mtime')
    expect(index).toHaveProperty('body')

    expect(index.body).toMatchSnapshot('basic-index-body')
  })

  test('Get ignored contents', async () => {
    const index = await $fetch('/api/_content/get/content:.ignored.md')

    expect(index).not.toHaveProperty('meta.mtime')
    expect(index).toMatchObject({})
    expect(index.body).toBeNull()
  })

  test('Get navigation', async () => {
    const list = await $fetch('/api/_content/navigation')

    expect(list).toMatchSnapshot('basic-navigation')
  })

  test('Get cats navigation', async () => {
    const list = await $fetch('/api/_content/navigation', {
      method: 'POST',
      body: {
        slug: '/cats'
      }
    })

    expect(list).toMatchSnapshot('basic-navigation-cats')
  })

  test('Get cats navigation', async () => {
    const list = await $fetch('/api/_content/navigation', {
      method: 'POST',
      body: {
        slug: '/dogs'
      }
    })

    expect(list).toMatchSnapshot('basic-navigation-dogs')
  })

  test('Search contents using `locale` helper', async () => {
    const fa = await $fetch('/locale-fa')

    expect(fa).toContain('fa-ir:fa:index.md')
    expect(fa).not.toContain('content:index.md')

    const en = await $fetch('/locale-en')

    expect(en).not.toContain('fa-ir:fa:index.md')
    expect(en).toContain('content:index.md')
  })

  test('Use default locale for unscoped contents', async () => {
    const index = await $fetch('/api/_content/get/content:index.md')

    expect(index).toHaveProperty('meta.mtime')
    expect(index).toMatchObject({
      meta: {
        locale: 'en'
      }
    })
  })
})
