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

      expect(style).toContain(`.${code[0].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[0].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[1].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[1].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[2].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[2].props.class}{color:#79C0FF}`)

      expect(style).toContain(`.${code[3].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[3].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[4].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[4].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[5].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[5].props.class}{color:#79C0FF}`)

      expect(style).toContain(`.${code[6].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[6].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[7].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[7].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[8].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[8].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[9].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[9].props.class}{color:#79C0FF}`)
    })

    test('highlight multi-theme with different tokenizer', async () => {
      const tokens = await $fetch('/api/highlight', {
        method: 'POST',
        body: {
          lang: 'ts',
          theme: {
            dark: 'one-dark-pro',
            default: 'github-light'
          },
          code: 'type UseFetchOptions = { key?: string }'
        }
      })

      expect(tokens).toMatchInlineSnapshot(`
        [
          [
            {
              "color": {
                "dark": "#C678DD",
                "default": "#CF222E",
              },
              "content": "type",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#24292F",
              },
              "content": " ",
            },
            {
              "color": {
                "dark": "#E5C07B",
                "default": "#953800",
              },
              "content": "UseFetchOptions",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#24292F",
              },
              "content": " ",
            },
            {
              "color": {
                "dark": "#56B6C2",
                "default": "#CF222E",
              },
              "content": "=",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#24292F",
              },
              "content": " { ",
            },
            {
              "color": {
                "dark": "#E06C75",
                "default": "#953800",
              },
              "content": "key",
            },
            {
              "color": {
                "dark": "#C678DD",
                "default": "#CF222E",
              },
              "content": "?",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#CF222E",
              },
              "content": ":",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#24292F",
              },
              "content": " ",
            },
            {
              "color": {
                "dark": "#E5C07B",
                "default": "#0550AE",
              },
              "content": "string",
            },
            {
              "color": {
                "dark": "#ABB2BF",
                "default": "#24292F",
              },
              "content": " }",
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
