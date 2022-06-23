import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testYamlParser = () => {
  describe('Parser (.yml)', () => {
    test('key:value', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.yml',
          content: 'key: value'
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.yml')

      expect(parsed).toHaveProperty('key', 'value')
    })

    test('array', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.yml',
          content: '- item 1 \n- item 2'
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.yml')

      expect(parsed).haveOwnProperty('body')
      expect(Array.isArray(parsed.body)).toBeTruthy()
      expect(parsed.body).toHaveLength(2)
      expect(parsed.body).toMatchObject(['item 1', 'item 2'])
    })
  })
}
