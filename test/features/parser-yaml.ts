import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testYamlParser = () => {
  describe('parser:yaml', () => {
    test('key:value', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.yml',
          content: 'key: value'
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.yml')

      expect(parsed).toHaveProperty('key', 'value')
    })
  })
}
