import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { example } from './utils'

describe('basic example', async () => {
  await setup(example('basic'))

  it('renders the catch-all page from a string-glob page collection', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Welcome to Nuxt Content starter')
    expect(html).toContain('Manage your contents')
  })

  it('resolves an MDC component declared next to the page', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Counter:')
    expect(html).toContain('Increment')
  })
})
