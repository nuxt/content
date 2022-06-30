import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { visit } from 'unist-util-visit'

export const testMarkdownParser = () => {
  describe('Parser (.md)', () => {
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
          id: 'content:index.md',
          content: [
            ':hello', // valid
            ':hello,', // valid
            ':hello :hello', // valid
            ':hello{}-world', // valid
            ':hello:hello', // invalid
            ':hello-world', // valid but with different name
            ':hello:', // invalid
            '`:hello`', // code
            ':rocket:' // emoji
          ].join('\n')
        }
      })

      let compComponentCount = 0
      visit(parsed.body, node => (node as any).tag === 'hello', () => {
        compComponentCount += 1
      })
      expect(compComponentCount).toEqual(5)

      const paragraph = parsed.body.children[0]
      expect(paragraph.children[0].tag).toEqual('hello')
      expect(paragraph.children[1].tag).toEqual('hello')
      expect(paragraph.children[3].tag).toEqual('hello')
      expect(paragraph.children[5].tag).toEqual('hello')
      expect(paragraph.children[6].tag).toEqual('hello')

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

    test('span attributes', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '# Hello [World]{.text-green}',
            'The answer to life the universe and everything: [42]{.font-bold .text-green}'
          ].join('\n')
        }
      })

      expect(parsed.body).toHaveProperty('children')
      expect(parsed.body.children.length).toEqual(2)
      expect(parsed.body.children[0].tag).toEqual('h1')
      expect(parsed.body.children[0].children[1].props.class).toEqual('text-green')

      expect(parsed.body.children[1].tag).toEqual('p')
      expect(parsed.body.children[1].children[1].props.class).toEqual('font-bold text-green')
    })
  })
}
