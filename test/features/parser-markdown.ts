import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testMarkdownParser = () => {
  describe('parser:markdown', () => {
    test('Index file', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '# Index'
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.md')

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('type', 'root')
      expect(parsed.body).toHaveProperty('children[0].tag', 'h1')
      expect(parsed.body).toHaveProperty('children[0].children[0].value', 'Index')
    })

    test('Html `<code>` should render as inline code', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '`code`'
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.md')
      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('type', 'root')
      expect(parsed.body).toHaveProperty('children[0].tag', 'p')
      expect(parsed.body).toHaveProperty('children[0].children[0].tag', 'code-inline')
    })
  })
}
