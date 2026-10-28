import { describe, expect, it } from 'vitest'
import type { ComarkContent, ContentFile, ContentListFile } from 'comark-content'
import { sourceQueryBuilder } from 'comark-content/database/utils/query'
import { withFullFiles } from '../src/runtime/v3/query'

const file = {
  path: '/about',
  data: { title: 'About', sitemap: false, modifiedAt: '2026-10-01', key: 'frontmatter-key' },
  meta: {
    key: 'content/about.md',
    source: 'content',
    stem: 'about',
    extension: '.md',
    kind: 'document',
    type: 'text/markdown',
    partial: false,
  },
  nodes: [],
} as unknown as ContentFile

const content = { get: async () => file } as unknown as Pick<ComarkContent, 'get'>
const query = () => withFullFiles(content, sourceQueryBuilder('content', async () => [file as ContentListFile]))

describe('withFullFiles', () => {
  it('exposes frontmatter under meta like v3', async () => {
    const doc = await query().first()

    expect(doc?.meta.sitemap).toBe(false)
    expect(doc?.meta.modifiedAt).toBe('2026-10-01')
    // Still flat for v4-style access.
    expect(doc?.sitemap).toBe(false)
  })

  it('keeps the file meta when frontmatter collides with it', async () => {
    const doc = await query().first()

    expect(doc?.meta.key).toBe('content/about.md')
    expect(doc?.id).toBe('content/about.md')
  })
})
