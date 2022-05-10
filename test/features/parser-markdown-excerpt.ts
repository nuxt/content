import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testMarkdownParserExcerpt = () => {
  describe('parser:markdown:excerpt', () => {
    test('Index file', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '# Index',
            'First paragraph',
            '<!--more-->',
            'Second paragraph'
          ].join('\n')
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.md')

      expect(parsed).toHaveProperty('body')
      expect(parsed.excerpt).toBeDefined()
      expect(parsed.excerpt.children).toHaveLength(3)

      // First child (H1)
      expect(parsed.excerpt.children[0]).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "type": "text",
              "value": "Index",
            },
          ],
          "props": {
            "id": "index",
          },
          "tag": "h1",
          "type": "element",
        }
      `)

      // Second child (newline)
      expect(parsed.excerpt.children[1].value).toBe('\n')

      // Third child (paragraph)
      expect(parsed.excerpt.children[2]).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "type": "text",
              "value": "First paragraph",
            },
          ],
          "props": {},
          "tag": "p",
          "type": "element",
        }
      `)
    })
  })
}
