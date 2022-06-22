import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testParserHooks = () => {
  describe('Parser (hooks)', () => {
    test('beforeParse', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '# hello'
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      expect(parsed).toHaveProperty('__beforeParse', true)
    })

    test('afterParse', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: '# hello'
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      expect(parsed).haveOwnProperty('body')
      expect(parsed).toHaveProperty('__afterParse', true)
    })
  })
}
