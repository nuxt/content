import { describe, test, expect, assert } from 'vitest'
import { z } from 'zod'
import GithubLight from 'shiki/themes/github-light.mjs'
import type { MDCElement } from '@nuxtjs/mdc'
import { parseContent } from '../../src/utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import type { MarkdownRoot } from '../../src/types/content'

const markdownOptions = { markdown: { compress: false } as Record<string, unknown> }

describe('Highlighter', () => {
  const collection = resolveCollection('content', defineCollection({
    type: 'page',
    source: 'content/**',
    schema: z.object({
    }),
  }), { rootDir: '~' })!

  test('themed', async () => {
    const parsed = await parseContent('content/index.md', [
      '```ts',
      'const a: number = 1',
      '```',
    ].join('\n'), collection, {
      markdown: {
        ...markdownOptions.markdown,
        highlight: {
          theme: {
            dark: 'material-theme-palenight', // Theme containing italic
            default: GithubLight,
          },
        },
      },
    })

    const colors = {
      default: '#D73A49 #005CC5 #D73A49 #005CC5 #D73A49 #005CC5'.split(' '),
      dark: '#C792EA #BABED8 #89DDFF #FFCB6B #89DDFF #F78C6C'.split(' '),
    }
    expect(parsed).toHaveProperty('_id')
    assert(parsed._id === 'content/index.md')

    const styleElement = parsed.body.children.pop()
    expect(styleElement.tag).toBe('style')
    const style = styleElement.children[0].value
    // @ts-expect-error - MDCText warning for children
    const code: MDCElement[] = (parsed.body as MarkdownRoot).children?.[0].children?.[0].children?.[0].children || []
    code.forEach((token, i) => {
      if (token.props?.style) {
        expect(token.props.style).includes(`--shiki-default:${colors.default[i]}`)
        expect(token.props.style).includes(`--shiki-dark:${colors.dark[i]}`)
      }
      else {
        expect(style).toContain(`.${token.props?.class}`)
        expect(style).toContain(`.dark .${token.props?.class}`)
      }
    })
  })

  test('highlight excerpt', async () => {
    const parsed = await parseContent('content/index.md', [
      '```ts',
      'const a: number = 1',
      '```',
      '<!--more-->',
      'Second block',
    ].join('\n'), collection, {
      markdown: {
        ...markdownOptions.markdown,
        highlight: {
          theme: {
            dark: 'material-theme-palenight', // Theme containing italic
            default: GithubLight,
          },
        },
      },
    })

    const styleExcerpt = parsed.meta.excerpt.children.pop()
    expect(styleExcerpt.tag).toBe('style')
    const styleBody = parsed.body.children.pop()
    expect(styleBody.tag).toBe('style')
  })
})
