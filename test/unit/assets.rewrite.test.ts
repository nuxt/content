import { describe, it, expect, beforeAll } from 'vitest'
import { createAfterParseHandler } from '../../src/utils/assets/rewrite'
import { setAssetExtensions } from '../../src/utils/assets/state'
import { DEFAULT_ASSET_EXTENSIONS, type AssetIndex, type ImageSizeHint, type UnresolvedIndex } from '../../src/utils/assets/shared'
import type { FileAfterParseHook } from '../../src/types'

function makeIndex(): AssetIndex {
  const index: AssetIndex = new Map()
  index.set('/abs/content/real-content/media/photo.png', { publicSrc: '/real-content/media/photo.png', width: 640, height: 480, content: [] })
  index.set('/abs/content/real-content/files/doc.pdf', { publicSrc: '/real-content/files/doc.pdf', content: [] })
  return index
}

function run(imageSize: ImageSizeHint[]) {
  const index = makeIndex()
  const content: Record<string, unknown> = {
    id: 'content/real-content/post.md',
    cover: 'media/01.photo.png',
    body: {
      type: 'minimark',
      value: [
        ['p', {}, ['img', { src: 'media/01.photo.png', alt: 'photo' }]],
        ['a', { href: 'files/doc.pdf' }, 'download'],
        ['img', { src: 'https://example.com/external.png' }],
      ],
    },
    meta: {
      featured: 'media/01.photo.png',
      gallery: ['media/01.photo.png'],
      note: 'just some text',
    },
  }
  const ctx = {
    file: { id: content.id, path: '/abs/content/1.real-content/post.md', dirname: '/abs/content/1.real-content' },
    content,
    collection: { name: 'content', type: 'page' },
  } as unknown as FileAfterParseHook

  createAfterParseHandler(index, { imageSizes: imageSize, blankLinks: true })(ctx)
  return { content, index }
}

describe('assets/rewrite', () => {
  beforeAll(() => setAssetExtensions(DEFAULT_ASSET_EXTENSIONS))

  it('rewrites relative paths to public URLs and strips ordering', () => {
    const { content } = run([])
    const body = content.body as { value: unknown[] }
    const img = (body.value[0] as unknown[])[2] as [string, Record<string, unknown>]
    expect(img[1].src).toBe('/real-content/media/photo.png')

    const link = body.value[1] as [string, Record<string, unknown>]
    expect(link[1].href).toBe('/real-content/files/doc.pdf')
    expect(link[1].target).toBe('_blank')

    expect((content.meta as Record<string, unknown>).featured).toBe('/real-content/media/photo.png')
    expect(((content.meta as Record<string, unknown>).gallery as string[])[0]).toBe('/real-content/media/photo.png')
    expect(content.cover).toBe('/real-content/media/photo.png')
  })

  it('leaves external and non-asset values untouched', () => {
    const { content } = run([])
    const body = content.body as { value: unknown[] }
    const external = body.value[2] as [string, Record<string, unknown>]
    expect(external[1].src).toBe('https://example.com/external.png')
    expect((content.meta as Record<string, unknown>).note).toBe('just some text')
  })

  it('injects aspect-ratio style on img with imageSize "style"', () => {
    const { content } = run(['style'])
    const body = content.body as { value: unknown[] }
    const img = (body.value[0] as unknown[])[2] as [string, Record<string, unknown>]
    expect(img[1].style).toBe('aspect-ratio: 640/480;')
  })

  it('injects width/height attrs on img with imageSize "attrs"', () => {
    const { content } = run(['attrs'])
    const body = content.body as { value: unknown[] }
    const img = (body.value[0] as unknown[])[2] as [string, Record<string, unknown>]
    expect(img[1].width).toBe(640)
    expect(img[1].height).toBe(480)
  })

  it('encodes size in frontmatter src query with imageSize "src"', () => {
    const { content } = run(['src'])
    expect((content.meta as Record<string, unknown>).featured).toBe('/real-content/media/photo.png?width=640&height=480')
  })

  it('builds a reverse index of referencing content ids', () => {
    const { index } = run(['style'])
    expect(index.get('/abs/content/real-content/media/photo.png')!.content.map(reference => reference.id)).toContain('content/real-content/post.md')
  })

  it('records references to a not-yet-existing asset, but not resolved ones', () => {
    const index = makeIndex()
    const unresolved: UnresolvedIndex = new Map()
    const content: Record<string, unknown> = {
      id: 'content/real-content/post.md',
      body: {
        type: 'minimark',
        value: [
          ['img', { src: 'media/missing.png' }],
          ['img', { src: 'media/photo.png' }],
        ],
      },
      meta: {},
    }
    const ctx = {
      file: { id: content.id, path: '/abs/content/1.real-content/post.md', dirname: '/abs/content/1.real-content' },
      content,
      collection: { name: 'content', type: 'page' },
    } as unknown as FileAfterParseHook

    createAfterParseHandler(index, { imageSizes: [], blankLinks: true, unresolved })(ctx)

    expect(unresolved.get('/abs/content/real-content/media/missing.png')?.map(reference => reference.id)).toContain('content/real-content/post.md')
    expect(unresolved.has('/abs/content/real-content/media/photo.png')).toBe(false)
  })
})
