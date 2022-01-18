import { describe, test, expect, assert } from 'vitest'
import plugin from '../../../src/runtime/server/transformer/plugin-markdown'

describe('Path Markdown Plugin', () => {
  test('Index file', async () => {
    const parsed = await plugin.parse('content:index.md', '# Index')

    expect(parsed).toHaveProperty('meta.id')
    assert(parsed.meta.id === 'content:index.md')

    expect(parsed).toHaveProperty('body')
    expect(parsed.body).toHaveProperty('type', 'root')
    expect(parsed.body).toHaveProperty('children[0].tag', 'prose-h1')
    expect(parsed.body).toHaveProperty('children[0].children[0].value', 'Index')
  })
})
