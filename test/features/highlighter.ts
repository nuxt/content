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

      const code = parsed.body.children[0].children[0].children[0].children[0].children

      expect(style).toContain(`.${code[0].props.class}{color:#CF222E;}`)
      expect(style).toContain(`.dark .${code[0].props.class}{color:#FF7B72;}`)

      expect(style).toContain(`.${code[1].props.class}{color:#24292F;}`)
      expect(style).toContain(`.dark .${code[1].props.class}{color:#C9D1D9;}`)

      expect(style).toContain(`.${code[2].props.class}{color:#0550AE;}`)
      expect(style).toContain(`.dark .${code[2].props.class}{color:#79C0FF;}`)

      expect(style).toContain(`.${code[3].props.class}{color:#CF222E;}`)
      expect(style).toContain(`.dark .${code[3].props.class}{color:#FF7B72;}`)

      expect(style).toContain(`.${code[4].props.class}{color:#24292F;}`)
      expect(style).toContain(`.dark .${code[4].props.class}{color:#C9D1D9;}`)

      expect(style).toContain(`.${code[5].props.class}{color:#0550AE;}`)
      expect(style).toContain(`.dark .${code[5].props.class}{color:#79C0FF;}`)

      expect(style).toContain(`.${code[6].props.class}{color:#24292F;}`)
      expect(style).toContain(`.dark .${code[6].props.class}{color:#C9D1D9;}`)

      expect(style).toContain(`.${code[7].props.class}{color:#CF222E;}`)
      expect(style).toContain(`.dark .${code[7].props.class}{color:#FF7B72;}`)

      expect(style).toContain(`.${code[8].props.class}{color:#24292F;}`)
      expect(style).toContain(`.dark .${code[8].props.class}{color:#C9D1D9;}`)

      expect(style).toContain(`.${code[9].props.class}{color:#0550AE;}`)
      expect(style).toContain(`.dark .${code[9].props.class}{color:#79C0FF;}`)
    })

    test('highlight multi-theme with different tokenizer', async () => {
      const tokens = await $fetch('/api/highlight', {
        method: 'POST',
        body: {
          lang: 'ts',
          theme: {
            dark: 'material-palenight', // Theme containing italic
            default: 'github-light'
          },
          code: 'export type UseFetchOptions = { key?: string }'
        }
      })

      expect(tokens).toMatchInlineSnapshot(`
        [
          [
            {
              "content": "export",
              "style": {
                "dark": {
                  "color": "#89DDFF",
                  "fontStyle": 1,
                },
                "default": {
                  "color": "#CF222E",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "type",
              "style": {
                "dark": {
                  "color": "#C792EA",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#CF222E",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "UseFetchOptions",
              "style": {
                "dark": {
                  "color": "#FFCB6B",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#953800",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "=",
              "style": {
                "dark": {
                  "color": "#89DDFF",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#CF222E",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "{",
              "style": {
                "dark": {
                  "color": "#89DDFF",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "key",
              "style": {
                "dark": {
                  "color": "#F07178",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#953800",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "?:",
              "style": {
                "dark": {
                  "color": "#89DDFF",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#CF222E",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "string",
              "style": {
                "dark": {
                  "color": "#FFCB6B",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#0550AE",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": " ",
              "style": {
                "dark": {
                  "color": "#A6ACCD",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
            {
              "content": "}",
              "style": {
                "dark": {
                  "color": "#89DDFF",
                  "fontStyle": 0,
                },
                "default": {
                  "color": "#24292F",
                  "fontStyle": 0,
                },
              },
            },
          ],
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
