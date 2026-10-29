import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

type Page = { body: { type: string, value: unknown[], toc?: unknown } }

describe('body', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/body', import.meta.url)),
  })

  // v3 returns `body` as `{ type: 'minimark', value, toc }`, and apps read `body.toc` for their TOC.
  it('returns the body in v3 shape', async () => {
    const page = await $fetch<Page>('/api/page')
    expect(page.body.type).toBe('minimark')
    expect(page.body.value).toBeInstanceOf(Array)
  })

  it('includes the table of contents, configured by `content.build.markdown.toc`', async () => {
    const page = await $fetch<Page>('/api/page')
    expect(page.body.toc).toEqual({
      title: '',
      depth: 3,
      searchDepth: 2,
      links: [
        { id: 'getting-started', depth: 2, text: 'Getting started', children: [{ id: 'install', depth: 3, text: 'Install', children: [{ id: 'requirements', depth: 4, text: 'Requirements' }] }] },
        { id: 'usage', depth: 2, text: 'Usage' },
      ],
    })
  })

  it('renders the body with `ContentRenderer`', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Use the module.')
  })
})
