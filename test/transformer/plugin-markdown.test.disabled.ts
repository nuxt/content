import { describe, test, expect, assert } from 'vitest'
import plugin from '../../src/runtime/server/transformers/markdown'

describe('Path Markdown Plugin', () => {
  test('Index file', async () => {
    const parsed = await plugin.parse!('content:index.md', '# Index')

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content:index.md')

    expect(parsed).toHaveProperty('body')
    expect(parsed.body).toHaveProperty('type', 'root')
    expect(parsed.body).toHaveProperty('children[0].tag', 'h1')
    expect(parsed.body).toHaveProperty('children[0].children[0].value', 'Index')
  })

  test('Html `<code>` should render as inline code', async () => {
    const parsed = await plugin.parse!('content:index.md', '`code`')

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content:index.md')
    expect(parsed).toHaveProperty('body')
    expect(parsed.body).toHaveProperty('type', 'root')
    expect(parsed.body).toHaveProperty('children[0].tag', 'p')
    expect(parsed.body).toHaveProperty('children[0].children[0].tag', 'code-inline')
  })
})
