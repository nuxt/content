import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testHighlighter = () => {
  describe('Highlighter', () => {
    test('themed', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '```ts',
            'const a: number = 1',
            '```'
          ].join('\n')
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      const styleElement = parsed.body.children.pop()
      expect(styleElement.tag).toBe('style')
      const style = styleElement.children[0].value
      const code = parsed.body.children[0].children[0].children[0].children

      for (const token of code) {
        expect(style).toContain(`.${token.props.class}`)
        expect(style).toContain(`.dark .${token.props.class}`)
      }
    })

    test('highlight multi-theme with different tokenizer', async () => {
      const { tree } = await $fetch('/api/_mdc/highlight', {
        params: {
          lang: 'ts',
          theme: JSON.stringify({
            dark: 'material-theme-palenight', // Theme containing italic
            default: 'github-light'
          }),
          code: 'export type UseFetchOptions = { key?: string }'
        }
      })

      expect(tree).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "children": [
                  {
                    "type": "text",
                    "value": "export",
                  },
                ],
                "properties": {
                  "class": "ct-510828",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "type",
                  },
                ],
                "properties": {
                  "class": "ct-757323",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "UseFetchOptions",
                  },
                ],
                "properties": {
                  "class": "ct-941645",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "=",
                  },
                ],
                "properties": {
                  "class": "ct-943635",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "{",
                  },
                ],
                "properties": {
                  "class": "ct-695709",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "key",
                  },
                ],
                "properties": {
                  "class": "ct-411742",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "?:",
                  },
                ],
                "properties": {
                  "class": "ct-943635",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "string",
                  },
                ],
                "properties": {
                  "class": "ct-559631",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": " ",
                  },
                ],
                "properties": {
                  "class": "ct-508774",
                },
                "tagName": "span",
                "type": "element",
              },
              {
                "children": [
                  {
                    "type": "text",
                    "value": "}",
                  },
                ],
                "properties": {
                  "class": "ct-695709",
                },
                "tagName": "span",
                "type": "element",
              },
            ],
            "properties": {
              "class": "line",
              "line": 1,
            },
            "tagName": "span",
            "type": "element",
          },
        ]
      `)
    })

    test('highlight excerpt', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '```ts',
            'const a: number = 1',
            '```',
            '<!--more-->',
            'Second block'
          ].join('\n')
        }
      })

      const styleExcerpt = parsed.excerpt.children.pop()
      expect(styleExcerpt.tag).toBe('style')
      const styleBody = parsed.body.children.pop()
      expect(styleBody.tag).toBe('style')
    })
  })
}
