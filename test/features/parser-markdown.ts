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

    test('Keep meta from fenced code block', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '```ts [file.ts]{4-6,7} other code block info',
            'let code = undefined;',
            'return code;',
            '```'
          ].join('\n')
        }
      })

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('children[0].tag', 'code')
      expect(parsed.body).toHaveProperty('children[0].props')
      const props = parsed.body.children[0].props
      expect(props).toHaveProperty('meta')
      expect(props.meta).toBe('[file.ts]{4-6,7} other code block info')
      expect(props.language).toBe('ts')
      expect(props.filename).toBe('file.ts')
      expect(props.highlights).toEqual([4, 5, 6, 7])
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
            ':hello-world', // valid but with different name
            ':hello,', // valid
            ':hello :hello', // valid
            ':hello{}-world', // valid
            ':hello:hello', // invalid
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

      expect(parsed.body.children[0].tag).toEqual('hello')
      expect(parsed.body.children[1].tag).toEqual('hello-world')

      const paragraph = parsed.body.children[2]
      expect(paragraph.children[0].tag).toEqual('hello')
      expect(paragraph.children[2].tag).toEqual('hello')
      expect(paragraph.children[4].tag).toEqual('hello')
      expect(paragraph.children[5].tag).toEqual('hello')

      // Check conflict between inline compoenent and emoji
      expect(paragraph.children.pop().value).toContain('🚀')
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

    test('handle markdown file path as link', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '[link1](3.x)',
            '[link1](./3.x)',
            '[link1](foo)',
            '[link1](foo.md)',
            '[link1](01.foo.md)',
            '[link1](./01.foo.md)',
            '[link1](./../01.foo.md)',
            '[link1](../01.foo.md)',
            '[link1](../../01.foo.md)',
            '[link1](../../01.foo#bar.md)',
            '[link1](../../01.foo.draft.md)',
            '[link1](../../_foo.draft.md)'
          ].join('\n')
        }
      })

      const nodes = parsed.body.children[0].children
      expect(nodes.shift().props.href).toEqual('3.x')
      expect(nodes.shift().props.href).toEqual('./3.x')
      expect(nodes.shift().props.href).toEqual('foo')
      expect(nodes.shift().props.href).toEqual('foo')
      expect(nodes.shift().props.href).toEqual('foo')
      expect(nodes.shift().props.href).toEqual('./foo')
      expect(nodes.shift().props.href).toEqual('./../foo')
      expect(nodes.shift().props.href).toEqual('../foo')
      expect(nodes.shift().props.href).toEqual('../../foo')
      expect(nodes.shift().props.href).toEqual('../../foobar')
      expect(nodes.shift().props.href).toEqual('../../foo')
      expect(nodes.shift().props.href).toEqual('../../_foo')
    })

    test('No trailing dashes in heading ids', async () => {
      const headings = [
        '# `<Alert />` ',
        '## `<Alert />` -',
        '### `<Alert />` \\#',
        '### `<Alert />`.',
        '### 🎨 Alert'
      ]
      for (const heading of headings) {
        const parsed = await $fetch('/api/parse', {
          method: 'POST',
          body: {
            id: 'content:index.md',
            content: heading
          }
        })
        expect(parsed.body.children[0].props.id).toEqual('alert')
      }
    })
  })
}
