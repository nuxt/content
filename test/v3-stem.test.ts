import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

type File = { stem: string, extension: string }
type Nav = { path: string, stem?: string, page?: false, children?: Nav[] }
interface Response {
  files: Record<'docs_en' | 'docs_foo' | 'docs_root' | 'landing_en' | 'multi', File[]>
  byStem: File | null
  byExtension: File[]
  navigation: Record<'docs_en' | 'docs_root', Nav[]>
}

function flatten(nodes: Nav[]): Pick<Nav, 'path' | 'stem'>[] {
  return nodes.flatMap(node => [{ path: node.path, stem: node.stem }, ...flatten(node.children ?? [])])
}

describe('v3-stem', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/v3-stem', import.meta.url)),
  })

  // v3: `stem` is the collection prefix followed by the path under the static part of `include`.
  // Comark measures it from the source folder, and stores `extension` with its dot.
  it('returns v3 stems and extensions', async () => {
    const { files } = await $fetch<Response>('/api/files')
    expect(files).toEqual({
      docs_en: [{ stem: 'en/1.guide/2.page', extension: 'md' }],
      docs_foo: [{ stem: 'foo/1.guide/2.page', extension: 'md' }],
      docs_root: [{ stem: '1.guide/2.page', extension: 'md' }],
      landing_en: [{ stem: 'en/index', extension: 'md' }],
      // Each source of the collection keeps its own prefix.
      multi: [
        { stem: 'multi/en/1.guide/2.page', extension: 'md' },
        { stem: 'multi/fr/1.guide/3.other', extension: 'md' },
      ],
    })
  })

  it('filters on the v3 `stem` and `extension`', async () => {
    const { byStem, byExtension } = await $fetch<Response>('/api/files')
    expect(byStem).toEqual({ stem: 'en/1.guide/2.page', extension: 'md' })
    expect(byExtension).toEqual([{ stem: 'en/1.guide/2.page', extension: 'md' }])
  })

  it('returns v3 stems in navigation', async () => {
    const { navigation } = await $fetch<Response>('/api/files')
    // Folders take their stem from their pages, prefix included, as in v3.
    expect(flatten(navigation.docs_en)).toEqual([
      { path: '/en', stem: 'en' },
      { path: '/en/guide', stem: 'en/1.guide' },
      { path: '/en/guide/page', stem: 'en/1.guide/2.page' },
    ])
    expect(flatten(navigation.docs_root)).toEqual([
      { path: '/guide', stem: '1.guide' },
      { path: '/guide/page', stem: '1.guide/2.page' },
    ])
  })
})
