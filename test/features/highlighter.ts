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
          ].join('\n'),
          options: {
            markdown: {
              highlight: {
                theme: {
                  dark: 'material-theme-palenight', // Theme containing italic
                  default: 'github-light'
                }
              }
            }
          }
        }
      })
      const colors = {
        default: '#D73A49 #005CC5 #D73A49 #005CC5 #D73A49 #005CC5'.split(' '),
        dark: '#C792EA #BABED8 #89DDFF #FFCB6B #89DDFF #F78C6C'.split(' ')
      }
      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      const styleElement = parsed.body.children.pop()
      expect(styleElement.tag).toBe('style')
      const style = styleElement.children[0].value
      const code = parsed.body.children[0].children[0].children[0].children as any[]
      code.forEach((token, i) => {
        if (token.props.style) {
          expect(token.props.style).includes(`color:${colors.default[i]}`)
          expect(token.props.style).includes(`--shiki-dark:${colors.dark[i]}`)
        } else {
          expect(style).toContain(`.${token.props.class}`)
          expect(style).toContain(`.dark .${token.props.class}`)
        }
      })
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
