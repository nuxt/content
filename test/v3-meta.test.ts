import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('v3 frontmatter under meta', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/v3-meta', import.meta.url)),
  })

  // v3 stored frontmatter outside the schema under `meta`, which sitemap sources rely on.
  it('drops pages with `sitemap: false` and keeps `modifiedAt`', async () => {
    const urls = await $fetch<Array<{ loc: string, lastmod?: string }>>('/api/__sitemap__/urls')
    const byLoc = Object.fromEntries(urls.map(url => [url.loc, url.lastmod]))

    expect(Object.keys(byLoc).sort()).toEqual(['/', '/blog/hello'])
    expect(byLoc['/']).toMatch(/^2026-10-01/)
    expect(byLoc['/blog/hello']).toMatch(/^2026-09-15/)
  })
})
