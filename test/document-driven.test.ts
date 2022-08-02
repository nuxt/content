import { fileURLToPath } from 'url'
import { test, describe, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('fixtures:document-driven', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/document-driven', import.meta.url)),
    server: true
  })

  test('<title> from front-matter', async () => {
    const html = await $fetch('/')

    expect(html).contains('<title>Home</title>')
  })

  test('disabled document driven', async () => {
    const html = await $fetch('/disabled')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: </div>')
  })

  test('disabled surround', async () => {
    const html = await $fetch('/no-surround')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: {')
  })

  test('custom content with path', async () => {
    const html = await $fetch('/home')

    expect(html).contains('Home')
    expect(html).contains('Hello World!')

    expect(html).contains('with previous link /')
    expect(html).contains('with next link /layout')
  })

  test('custom content with condition', async () => {
    const html = await $fetch('/custom-search')

    expect(html).contains('FM Data')

    expect(html).contains('with previous link /layout')
    expect(html).contains('with next link /no-surround')
  })

  test('404 page', async () => {
    try {
      await $fetch('/page-not-found')
    } catch (e) {
      expect(e.response.status).toBe(404)
      expect(e.response.statusText).toBe('Not found')
    }
  })
})
