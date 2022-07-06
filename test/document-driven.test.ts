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

    expect(html).contains('Home | Document Driven Fixture')
  })

  test('disabled document driven', async () => {
    const html = await $fetch('/disabled')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: </div>')
  })

  test('disabled surround document driven', async () => {
    const html = await $fetch('/no-surround')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: {')
  })
})
