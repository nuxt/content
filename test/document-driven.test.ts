import { fileURLToPath } from 'url'
import { test, describe, expect } from 'vitest'
import { setup, $fetch, url } from '@nuxt/test-utils'

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

  test('useContentHead(): og:image with string', async () => {
    const html = await $fetch('/fm-data')

    expect(html).contains('<meta property="og:image" content="https://picsum.photos/400/200">')
  })

  test('useContentHead(): og:image with object', async () => {
    const html = await $fetch('/og-image')

    expect(html).contains('<meta property="og:image" content="https://picsum.photos/400/200">')
    expect(html).contains('<meta property="og:image:width" content="400">')
    expect(html).contains('<meta property="og:image:height" content="200">')
  })

  test('404 page', async () => {
    try {
      await $fetch('/page-not-found')
    } catch (e) {
      expect(e.response.status).toBe(404)
      expect(e.response.statusText).toBe('Not Found')
    }
  })

  test('redirect in `_dir.yml`', async () => {
    const response = await fetch(url('/redirect'))
    expect(response.url).toBe('https://v2.nuxt.com/')
  })
})
