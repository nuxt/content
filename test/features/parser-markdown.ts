import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { visit } from 'unist-util-visit'

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

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

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

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')
      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('type', 'root')
      expect(parsed.body).toHaveProperty('children[0].tag', 'p')
      expect(parsed.body).toHaveProperty('children[0].children[0].tag', 'code-inline')
    })

    test('comment', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '<!-- comment -->'
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')
      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('type', 'root')
      expect(parsed.body).toHaveProperty('children')

      expect(parsed.body.children.length).toEqual(0)
    })

    test('empty file with new lines', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: ['', '', ''].join('\n')
        }
      })

      expect(parsed.body).toHaveProperty('children')
      expect(parsed.body.children.length).toEqual(0)
    })

    test('inline component followed by non-space characters', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          content: [
            ':hello', // valid
            ':hello,', // valid
            ':hello-world', // valid but with different name
            ':hello{}-world', // valid
            ':hello:', // invalid
            ':rocket:' // emoji
          ].join('\n')
        }
      })

      let compComponentCount = 0
      visit(parsed.body, node => (node as any).tag === 'hello', () => {
        compComponentCount += 1
      })
      expect(compComponentCount).toEqual(3)

      // Check conflict between inline compoenent and emoji
      expect(parsed.body.children[0].children.pop().value).toContain('🚀')
    })

    test('h1 tags', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '<h1>Hello</h1>'
        }
      })

      expect(parsed.body).toHaveProperty('children')
      expect(parsed.body.children.length).toEqual(1)
      expect(parsed.body.children[0].tag).toEqual('h1')
    })
  })
}
