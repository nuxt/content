import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import { parseContent } from '../utils/content'
import { createAfterParseHandler } from '../../src/utils/assets/rewrite'
import { setAssetExtensions } from '../../src/utils/assets/state'
import { DEFAULT_ASSET_EXTENSIONS, type AssetIndex, type AssetIndexEntry } from '../../src/utils/assets/shared'
import type { FileAfterParseHook } from '../../src/types'

type Element = [string, Record<string, unknown>, ...unknown[]]

function flatten(value: unknown[], out: Element[] = []): Element[] {
  for (const node of value) {
    if (Array.isArray(node) && typeof node[0] === 'string') {
      out.push(node as Element)
      flatten(node.slice(2), out)
    }
  }
  return out
}

function entry(publicSrc: string, width?: number, height?: number): AssetIndexEntry {
  return { publicSrc, width, height, content: [] }
}

// Only covers cases that depend on the shape the real parser produces (MDC
// components/bindings, raw HTML, fenced code, `./` + query). Pure rewrite logic
// (URL rewrite, target, imageSizes, frontmatter) is unit-tested in assets.rewrite.test.ts.
describe('assets rewrite (real parser)', async () => {
  await initiateValidatorsContext()
  setAssetExtensions(DEFAULT_ASSET_EXTENSIONS)

  const collection = resolveCollection('content', defineCollection({
    type: 'page',
    source: 'content/**',
    schema: z.object({ featured: z.string().optional(), gallery: z.array(z.string()).optional() }),
  }))!

  const index: AssetIndex = new Map([
    ['/invalid/media/photo.png', entry('/media/photo.png', 8, 4)],
    ['/invalid/files/doc.pdf', entry('/files/doc.pdf')],
    ['/invalid/media/clip.mp4', entry('/media/clip.mp4')],
    ['/invalid/media/poster.jpg', entry('/media/poster.jpg', 16, 9)],
    ['/invalid/media/example.html', entry('/media/example.html')],
    ['/invalid/media/raw.png', entry('/media/raw.png')],
    ['/invalid/media/a.png', entry('/media/a.png')],
    ['/invalid/media/b.png', entry('/media/b.png')],
    ['/invalid/media/incode.png', entry('/media/incode.png')],
  ])

  async function parse(imageSize: ('style' | 'attrs' | 'src' | 'url')[]) {
    const handler = createAfterParseHandler(index, { imageSizes: imageSize, blankLinks: true })
    const nuxtMock = {
      callHook(hook: string, ctx: FileAfterParseHook) {
        if (hook === 'content:file:afterParse') handler(ctx)
      },
    }
    const parsed = await parseContent('content/index.md', `---
featured: media/photo.png
gallery:
  - media/a.png
  - media/b.png
---

![markdown image](media/photo.png)

[a link](files/doc.pdf)

:video{src="media/clip.mp4" poster="media/poster.jpg"}

:img{:src="featured" alt="bound"}

<iframe src="media/example.html"></iframe>

<img src="media/raw.png">

\`\`\`ts
const x = "media/incode.png"
\`\`\`
`, collection, nuxtMock as never)
    return parsed as unknown as { body: { value: unknown[] }, featured?: unknown, gallery?: unknown }
  }

  it('MDC component literal attributes (src and poster) are rewritten', async () => {
    const video = flatten((await parse([])).body.value).find(e => e[0] === 'video')!
    expect(video[1].src).toBe('/media/clip.mp4')
    expect(video[1].poster).toBe('/media/poster.jpg')
  })

  it('MDC dynamic bindings (`:src`, `:images`) are left untouched', async () => {
    const els = flatten((await parse([])).body.value)
    expect(els.find(e => e[1][':src'] === 'featured')).toBeTruthy()
  })

  it('raw HTML iframe and img are rewritten', async () => {
    const els = flatten((await parse([])).body.value)
    expect(els.find(e => e[0] === 'iframe' && e[1].src === '/media/example.html')).toBeTruthy()
    expect(els.find(e => e[0] === 'img' && e[1].src === '/media/raw.png')).toBeTruthy()
  })

  it('paths inside fenced code are never rewritten', async () => {
    const json = JSON.stringify((await parse([])).body.value)
    expect(json).not.toContain('/media/incode.png')
  })

  it('preserves an existing query string and resolves a `./` prefix', async () => {
    const handler = createAfterParseHandler(index, { imageSizes: [], blankLinks: true })
    const parsed = await parseContent('content/index.md', '![q](media/photo.png?v=2)\n\n![dot](./media/photo.png)', collection, {
      callHook(hook: string, ctx: FileAfterParseHook) {
        if (hook === 'content:file:afterParse') handler(ctx)
      },
    } as never)
    const srcs = flatten((parsed.body as { value: unknown[] }).value).filter(e => e[0] === 'img').map(e => e[1].src)
    expect(srcs).toEqual(['/media/photo.png?v=2', '/media/photo.png'])
  })

  it('external and absolute references are never touched', async () => {
    const md = `![x](https://example.com/a.png)\n\n![y](/public/b.png)`
    const handler = createAfterParseHandler(index, { imageSizes: [], blankLinks: true })
    const parsed = await parseContent('content/index.md', md, collection, {
      callHook(hook: string, ctx: FileAfterParseHook) {
        if (hook === 'content:file:afterParse') handler(ctx)
      },
    } as never)
    const imgs = flatten((parsed.body as { value: unknown[] }).value).filter(e => e[0] === 'img')
    expect(imgs.map(e => e[1].src)).toEqual(['https://example.com/a.png', '/public/b.png'])
  })
})
