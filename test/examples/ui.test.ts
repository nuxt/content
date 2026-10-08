import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { example } from './utils'

describe('ui example', async () => {
  await setup(example('ui'))

  it('renders the page collection through the UI layout', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Welcome to Nuxt Content starter')
    expect(html).toContain('Counter:')
  })
})
