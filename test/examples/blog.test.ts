import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { example } from './utils'

describe('blog example', async () => {
  await setup(example('blog'))

  it('lists collection items queried with select/order/all', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Mount Everest')
    expect(html).toContain('Mount Damavand')
    // Ordered by date descending, so the newer post comes first.
    expect(html.indexOf('Mount Everest')).toBeLessThan(html.indexOf('Mount Damavand'))
  })

  it('renders a single post resolved by path', async () => {
    const html = await $fetch<string>('/blog/mount-everest')
    expect(html).toContain('Mount Everest')
    expect(html).toContain('the tallest mountain in the world')
  })
})
