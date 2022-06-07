import { describe, expect, test } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testContentQuery = () => {
  describe('content-query', () => {
    test('Find index', async () => {
      const content = await $fetch('/')

      // Normal Prop
      expect(content).includes('Index')
    })
  })
}
