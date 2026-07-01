import fs from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { setup, $fetch } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'
import { initiateValidatorsContext } from '../src/utils/dependencies'

const resolver = createResolver(import.meta.url)

function findNode(value: unknown[], tag: string): [string, Record<string, unknown>, ...unknown[]] | undefined {
  for (const node of value) {
    if (Array.isArray(node) && typeof node[0] === 'string') {
      if (node[0] === tag) {
        return node as [string, Record<string, unknown>, ...unknown[]]
      }
      const found = findNode(node.slice(2), tag)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

async function cleanup() {
  await fs.rm(resolver.resolve('./fixtures/assets/node_modules'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/assets/.nuxt'), { recursive: true, force: true })
  await fs.rm(resolver.resolve('./fixtures/assets/.data'), { recursive: true, force: true })
}

describe('assets', async () => {
  await initiateValidatorsContext()

  await cleanup()
  afterAll(async () => {
    await cleanup()
  })

  await setup({
    rootDir: resolver.resolve('./fixtures/assets'),
    dev: true,
  })

  test('serves the copied asset', async () => {
    const png = await $fetch('/media/photo.png', { responseType: 'arrayBuffer' })
    expect(png.byteLength).toBeGreaterThan(0)
  })

  test('extracts image dimensions from disk and injects the aspect-ratio', async () => {
    const doc = await $fetch('/api/content/get?path=/') as { body: { value: unknown[] } }
    const img = findNode(doc.body.value, 'img')!
    expect(img[1].src).toBe('/media/photo.png')
    expect(img[1].style).toBe('aspect-ratio: 8/4;')
  })

  test('rewrites an asset link and opens it in a new tab', async () => {
    const doc = await $fetch('/api/content/get?path=/') as { body: { value: unknown[] } }
    const link = findNode(doc.body.value, 'a')!
    expect(link[1].href).toBe('/files/doc.pdf')
    expect(link[1].target).toBe('_blank')
  })

  test('rewrites a frontmatter asset path', async () => {
    const doc = await $fetch('/api/content/get?path=/') as { featured: string }
    expect(doc.featured).toBe('/media/photo.png')
  })

  test('rewrites an array of frontmatter asset paths', async () => {
    const doc = await $fetch('/api/content/get?path=/') as { gallery: string[] }
    expect(doc.gallery).toEqual(['/media/photo.png', '/media/photo.png'])
  })

  test('rewrites iframe and embed sources and serves non-image assets', async () => {
    const doc = await $fetch('/api/content/get?path=/') as { body: { value: unknown[] } }
    expect(findNode(doc.body.value, 'iframe')![1].src).toBe('/media/page.html')
    expect(findNode(doc.body.value, 'embed')![1].src).toBe('/files/doc.pdf')

    const html = await $fetch('/media/page.html', { responseType: 'text' })
    expect(html.length).toBeGreaterThan(0)
  })

  test('resolves a parent-folder relative path', async () => {
    const doc = await $fetch('/api/content/get?path=/posts/nested') as { body: { value: unknown[] } }
    expect(findNode(doc.body.value, 'img')![1].src).toBe('/media/photo.png')
  })
})
