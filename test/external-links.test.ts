import { describe, it, expect } from 'vitest'
import { parseMarkdown } from 'comark'
import externalLinks from '../src/runtime/server/internal/external-links'

describe('external-links plugin', () => {
  it('adds `rel="nofollow"` to external links only', async () => {
    const { nodes } = await parseMarkdown('[a](https://nuxt.com) [b](/about) [c](#top) [d](http://x.dev){rel="me"}', { plugins: [externalLinks()] })
    const links = (nodes[0] as any[]).slice(2).filter(node => Array.isArray(node) && node[0] === 'a')
    expect(links.map(link => link[1])).toEqual([
      { href: 'https://nuxt.com', rel: 'nofollow' },
      { href: '/about' },
      { href: '#top' },
      { href: 'http://x.dev', rel: 'me' },
    ])
  })
})
