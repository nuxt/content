import { fileURLToPath } from 'url'
import { assert, test, describe, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { fromByteArray } from 'base64-js'

describe('fixtures:basic', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true
  })

  const QUERY_ENDPOINT = '/api/_content/query'
  const fetchDocument = (id: string) => {
    const params = fromByteArray(Array.from(JSON.stringify({ first: true, where: { id } })).map(c => c.charCodeAt(0)) as any)
    return $fetch(`${QUERY_ENDPOINT}/${params}`)
  }

  test('List contents', async () => {
    const docs = await $fetch(`${QUERY_ENDPOINT}?only=id`)
    const ids = docs.map(doc => doc.id)

    assert(ids.length > 0)
    assert(ids.includes('content:index.md'))

    // Ignored files should be listed
    assert(ids.includes('content:.dot-ignored.md') === false, 'Ignored files with `.` should not be listed')
    assert(ids.includes('content:-dash-ignored.md') === false, 'Ignored files with `-` should not be listed')

    assert(ids.includes('fa-ir:fa:index.md') === true, 'Files with `fa-ir` prefix should be listed')
  })

  test('Get contents index', async () => {
    const index = await fetchDocument('content:index.md')

    expect(index).toHaveProperty('mtime')
    expect(index).toHaveProperty('body')

    expect(index.body).toMatchSnapshot('basic-index-body')
  })

  test('Get ignored contents', async () => {
    // eslint-disable-next-line node/handle-callback-err
    const ignored = await fetchDocument('content:.dot-ignored.md').catch(_err => null)

    expect(ignored).toBeNull()
  })

  test('Get navigation', async () => {
    const list = await $fetch('/api/_content/navigation')

    expect(list).toMatchSnapshot('basic-navigation')
  })

  test('Get cats navigation', async () => {
    const params = fromByteArray(Array.from(JSON.stringify({ slug: '/cats' })).map(c => c.charCodeAt(0)) as any)
    const list = await $fetch(`/api/_content/navigation/${params}`)

    expect(list).toMatchSnapshot('basic-navigation-cats')
  })

  test('Get cats navigation', async () => {
    const params = fromByteArray(Array.from(JSON.stringify({ slug: '/dogs' })).map(c => c.charCodeAt(0)) as any)
    const list = await $fetch(`/api/_content/navigation/${params}`)

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
    const index = await fetchDocument('content:index.md')

    expect(index).toHaveProperty('mtime')
    expect(index).toMatchObject({
      locale: 'en'
    })
  })

  test('features:multi-part-slug', async () => {
    const html = await $fetch('/features/multi-part-slug')
    expect(html).contains('Persian')
  })
})
