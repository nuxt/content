import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testParserOptions = () => {
  describe('Parser Options', () => {
    test('disable MDC syntax', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: ':component',
          options: {
            markdown: {
              mdc: false
            }
          }
        }
      })
      expect(parsed).toHaveProperty('_id')
      assert(parsed.body.children[0].tag === 'p')
      assert(parsed.body.children[0].children[0].type === 'text')
      assert(parsed.body.children[0].children[0].value === ':component')
    })

    test('custom locale', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: ':component',
          options: {
            pathMeta: {
              defaultLocale: 'jp'
            }
          }
        }
      })
      expect(parsed).toHaveProperty('_id')
      expect(parsed.locale).toBe('jp')
    })
  })
}
