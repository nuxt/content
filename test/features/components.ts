import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testComponents = () => {
  describe('components', () => {
    test('from content directory', async () => {
      const index = await $fetch('/components/from-content')

      expect(index).toContain('Lorem ipsum dolor sit, amet consectetur adipisicing elit.')
    })
  })
}
