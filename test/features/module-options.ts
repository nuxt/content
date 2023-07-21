import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testModuleOptions = () => {
  describe('Module Options', () => {
    test('Overwrite `remark-emoji` options: disable emoticon', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '# Hello :-)'
          ].join('\n'),
          options: {
            markdown: {
              remarkPlugins: {
                'remark-emoji': false
              }
            }
          }
        }
      })
      expect(parsed.body.children[0].children[0].value).not.toContain('😃')
    })

    test('Disable `remark-gfm`', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '~one~'
          ].join('\n')
        }
      })
      expect(parsed.body.children[0].children[0].value).toBe('~one~')
    })

    test('Add `remark-oembed`', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            'https://www.youtube.com/watch?v=aoLhACqJCUg'
          ].join('\n')
        }
      })
      expect(parsed.body.children[0].props.className).toContain('remark-oembed-you-tube')
    }, 10000)

    test('Add `rehype-figure`', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: [
            '![Alt](https://nuxtjs.org/design-kit/colored-logo.svg)'
          ].join('\n')
        }
      })
      expect(parsed.body.children[0].props.className).toContain('rehype-figure')
      expect(parsed.body.children[0].tag).toContain('figure')
    }, 10000)
  })
}
