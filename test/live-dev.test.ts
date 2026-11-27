import { describe, it, expect } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils/e2e'
import { liveFixtureDir } from './fixtures/live-fixture'

describe('live content in dev', async () => {
  await setup({
    rootDir: liveFixtureDir,
    dev: true,
  })

  it('reads the sources as they are, without calling `live.ref`', { timeout: 30_000 }, async () => {
    expect(JSON.stringify(await $fetch('/__nuxt_content/get/docs'))).toContain('Docs at d1')
    expect(await $fetch('/api/served')).toEqual({
      site: [{ status: expect.any(String) }],
      docs: [{ status: expect.any(String) }],
    })
    expect((await $fetch<{ asked: string[] }>('/api/forge')).asked.filter(request => /^(?:head|commits) /.test(request))).toEqual([])
  })

  it('fails `revalidateContent()`: there is no commit to move', { timeout: 30_000 }, async () => {
    const response = await fetch('/api/push', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ repo: 'acme/docs', head: 'd3' }) })
    expect(response.status).toBe(500)
    expect((await response.json()).error).toMatch(/^revalidateContent: in dev/)
  })
})
