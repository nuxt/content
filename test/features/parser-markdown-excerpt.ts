import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testMarkdownParserExcerpt = () => {
  describe('Parser (.md excerpt)', () => {
    test('Index file', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '# Index',
            'First paragraph',
            '',
            '<!--more-->',
            '',
            'Second paragraph'
          ].join('\n')
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      expect(parsed).toHaveProperty('body')
      expect(parsed.excerpt).toBeDefined()
      expect(parsed.excerpt.children).toHaveLength(2)

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
      // Second child (paragraph)
      expect(parsed.excerpt.children[1]).toMatchInlineSnapshot(`
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

    test('When no <!--more--> then excerpt is undefined', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '# Index',
            'First paragraph',
            '',
            'Second paragraph'
          ].join('\n')
        }
      })

      expect(parsed.excerpt).not.toBeDefined()
    })
  })
}
