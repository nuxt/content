import { fileURLToPath } from 'url'
import { test, describe, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Advanced usage', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true,
    dev: false,
    nuxtConfig: {
      content: {
        prefetch: false
      }
    }
  })

  test('Disable query prefetching', async () => {
    const html = await $fetch('/')
    expect(html).not.toContain('<link rel="prefetch" href="/api/_content/query')
  })
})
