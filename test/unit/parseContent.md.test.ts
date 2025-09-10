import { describe, test, expect, assert } from 'vitest'
import { z } from 'zod'
import { visit } from 'unist-util-visit'
import type { Nuxt } from '@nuxt/schema'
import { parseContent } from '../utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

const nuxtMock = {
  options: {
    content: {
      build: {
        markdown: {
          remarkPlugins: {
            'remark-mdc': {
              options: {
                experimental: {
                  autoUnwrap: true,
                },
              },
            },
          },
        },
      },
    },
    mdc: {
      compress: false,
      markdown: {
      } as Record<string, unknown>,
    },
  },
} as unknown as Nuxt

describe('Parser (.md)', async () => {
  await initiateValidatorsContext()

  const collection = resolveCollection('content', defineCollection({
    type: 'page',
    source: 'content/**',
    schema: z.object({
    }),
  }))!

  test('Index file', async () => {
    const parsed = await parseContent('content/index.md', '# Index', collection, nuxtMock)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.md')

    expect(parsed).toHaveProperty('body')
    expect(parsed.body).toHaveProperty('type', 'root')
    expect(parsed.body).toHaveProperty('children[0].tag', 'h1')
    expect(parsed.body).toHaveProperty('children[0].children[0].value', 'Index')
  })

  describe('Code Block', () => {
    test('Html `<code>` should render as inline code', async () => {
      const parsed = await parseContent('content/index.md', '`code`', collection, nuxtMock)

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content/index.md')
      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('type', 'root')
      expect(parsed.body).toHaveProperty('children[0].tag', 'p')
      expect(parsed.body).toHaveProperty('children[0].children[0].tag', 'code')
    })

    test('Keep meta from fenced code block', async () => {
      const parsed = await parseContent('content/index.md', [
        '```ts [file.ts]{4-6,7} other code block info',
        'let code = undefined;',
        'return code;',
        '```',
      ].join('\n'), collection, nuxtMock)

      expect(parsed).toHaveProperty('body')
      expect(parsed.body.children[0].tag).toBe('pre')
      expect(parsed.body).toHaveProperty('children[0].props')
      const props = parsed.body.children[0].props
      expect(props).toHaveProperty('meta')
      expect(props.meta).toBe('other code block info')
      expect(props.language).toBe('ts')
      expect(props.filename).toBe('file.ts')
      expect(props.highlights).toEqual([4, 5, 6, 7])
    })

    test('Keep meta from fenced code block without space', async () => {
      const parsed = await parseContent('content/index.md', [
        '```ts[file.ts]{4-6,7}other code block info',
        'let code = undefined;',
        'return code;',
        '```',
      ].join('\n'), collection, nuxtMock)

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('children[0].tag', 'pre')
      expect(parsed.body).toHaveProperty('children[0].props')
      const props = parsed.body.children[0].props
      expect(props).toHaveProperty('meta')
      expect(props.meta).toBe('other code block info')
      expect(props.language).toBe('ts')
      expect(props.filename).toBe('file.ts')
      expect(props.highlights).toEqual([4, 5, 6, 7])
    })

    test('Keep meta from fenced code block without language', async () => {
      const parsed = await parseContent('content/index.md', [
        '```[] {4-6,7} other code block info',
        'let code = undefined;',
        'return code;',
        '```',
      ].join('\n'), collection, nuxtMock)

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('children[0].tag', 'pre')
      expect(parsed.body).toHaveProperty('children[0].props')
      const props = parsed.body.children[0].props
      expect(props).toHaveProperty('meta')
      expect(props.meta).toBe('other code block info')
      expect(props.language).toBe('text')
      expect(props.filename).toBe(undefined)
      expect(props.highlights).toEqual([4, 5, 6, 7])
    })
  })

  describe('Frontmatter', () => {
    test('mark content as draft', async () => {
      const parsed = await parseContent('content/index.md', [
        '---',
        '_draft: true',
        '---',
        '# Draft',
      ].join('\n'), collection, nuxtMock)

      expect(parsed.meta._draft).toBe(true)
    })

    test('mark content as non draft', async () => {
      const parsed = await parseContent('content/index.md', [
        '---',
        '_draft: false',
        '---',
        '# Draft',
      ].join('\n'), collection)

      expect(parsed.meta._draft).toBe(false)
    })
  })

  test('comment', async () => {
    const parsed = await parseContent('content/index.md', '<!-- comment -->', collection, nuxtMock)

    expect(parsed).toHaveProperty('id')
    assert(parsed.id === 'content/index.md')
    expect(parsed).toHaveProperty('body')
    expect(parsed.body).toHaveProperty('type', 'root')
    expect(parsed.body).toHaveProperty('children')

    expect(parsed.body.children.length).toEqual(0)
  })

  test('empty file with new lines', async () => {
    const parsed = await parseContent('content/index.md', ['', '', ''].join('\n'), collection, nuxtMock)

    expect(parsed.body).toHaveProperty('children')
    expect(parsed.body.children.length).toEqual(0)
  })

  test('inline component followed by non-space characters', async () => {
    const parsed = await parseContent('content/index.md', [
      ':hello', // valid
      ':hello-world', // valid but with different name
      ':hello,', // valid
      ':hello :hello', // valid
      ':hello{}-world', // valid
      ':hello:hello', // invalid
      ':hello:', // invalid
      '`:hello`', // code
      ':rocket:', // emoji
    ].join('\n'), collection, nuxtMock)

    let compComponentCount = 0
    visit(parsed.body, node => (node as unknown as { tag: string }).tag === 'hello', () => {
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

    // Check conflict between inline component and emoji
    expect(paragraph.children.pop().value).toContain('🚀')
  })

  test('h1 tags', async () => {
    const parsed = await parseContent('content/index.md', '<h1>Hello</h1>', collection, nuxtMock)

    expect(parsed.body).toHaveProperty('children')
    expect(parsed.body.children.length).toEqual(1)
    expect(parsed.body.children[0].tag).toEqual('h1')
  })

  test('span attributes', async () => {
    const parsed = await parseContent('content/index.md', [
      '# Hello [World]{.text-green}',
      'The answer to life the universe and everything: [42]{.font-bold .text-green}',
    ].join('\n'), collection, nuxtMock)

    expect(parsed.body).toHaveProperty('children')
    expect(parsed.body.children.length).toEqual(2)
    expect(parsed.body.children[0].tag).toEqual('h1')
    expect(parsed.body.children[0].children[1].props.className).toEqual(['text-green'])

    expect(parsed.body.children[1].tag).toEqual('p')
    expect(parsed.body.children[1].children[1].props.className).toEqual(['font-bold', 'text-green'])
  })

  test('handle markdown file path as link', async () => {
    const parsed = await parseContent('content/index.md', [
      '[link1](3.x)',
      '[link1](./3.x)',
      '[link1](foo)',
      '[link1](foo.md)',
      '[link1](01.foo.md)',
      '[link1](./01.foo.md)',
      '[link1](./../01.foo.md)',
      '[link1](../01.foo.md)',
      '[link1](../../01.foo.md)',
      '[link1](../../01.foo.md#bar)',
      '[link1](../../01.foo/file.md#bar)',
      '[link1](../../01.foo.draft.md)',
      '[link1](../../_foo.draft.md)',
    ].join('\n'), collection, nuxtMock)

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
    expect(nodes.shift().props.href).toEqual('../../foo#bar')
    expect(nodes.shift().props.href).toEqual('../../foo/file#bar')
    expect(nodes.shift().props.href).toEqual('../../foo')
    expect(nodes.shift().props.href).toEqual('../../_foo')
  })

  test('No trailing dashes in heading ids', async () => {
    const headings = [
      '# `<Alert />` ',
      '## `<Alert />` -',
      '### `<Alert />` \\#',
      '### `<Alert />`.',
      '### 🎨 Alert',
    ]
    for (const heading of headings) {
      const parsed = await parseContent('content/index.md', heading, collection, nuxtMock)

      expect(parsed.body.children[0].props.id).toEqual('alert')
    }
  })

  test('Unwrap component only child', async () => {
    const tests = [
      { markdown: `::component\nHello\n::`, firstChild: { type: 'text', value: 'Hello' } },
      { markdown: `::component\nHello :world\n::`, firstChild: { type: 'text', value: 'Hello ' } },
      { markdown: `::component\n - item 1\n - item 2\n::`, firstChild: { type: 'element', tag: 'li' } },
      { markdown: `:::component\n::nested-component\nHello\n::\n:::`, firstChild: { type: 'element', tag: 'nested-component' } },

    ]
    for (const { markdown, firstChild } of tests) {
      const parsed = await parseContent('content/index.md', markdown, collection, nuxtMock)

      expect(parsed.body.children[0].children[0]).toMatchObject(firstChild)
    }
  })
})
