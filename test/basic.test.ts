import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('extracts headings and the table of contents by default', async () => {
    const doc = await $fetch<{ meta: Record<string, any> }>('/__nuxt_content/get/')
    expect(doc.meta.title).toBe('Hello')
    expect(doc.meta.description).toBe('Intro paragraph.')
    expect(doc.meta.toc.links).toEqual([
      {
        id: 'getting-started',
        text: 'Getting started',
        depth: 2,
        children: [{ id: 'install', text: 'Install', depth: 3 }],
      },
    ])
  })

  it('links h2 to h4 headings to themselves by default, like v3', async () => {
    const doc = await $fetch<{ nodes: any[] }>('/__nuxt_content/get/')
    const heading = (tag: string) => doc.nodes.find(node => node[0] === tag)
    expect(heading('h1').slice(2)).toEqual(['Hello'])
    expect(heading('h2')[2]).toMatchObject(['a', { href: '#getting-started' }, 'Getting started'])
    expect(heading('h3')[2]).toMatchObject(['a', { href: '#install' }, 'Install'])
  })
})
