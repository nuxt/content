import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testSingleFileDriver = () => {
  describe('single-file-driver', () => {
    test('README', async () => {
      const parsed = await $fetch('/_partial/readme')

      expect(parsed).toContain('README')
      expect(parsed).toContain('<h1 id="readme">')
    })

    test('prefixed README', async () => {
      const parsed = await $fetch('/_partial/readme')

      expect(parsed).toContain('README')
      expect(parsed).toContain('<h1 id="readme">')
    })
  })
}
