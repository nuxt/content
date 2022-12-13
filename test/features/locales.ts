import { describe, expect, test } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'

export const testLocales = () => {
  // @ts-ignore
  const apiBaseUrl = useTestContext().options.nuxtConfig.content?.api?.baseURL || '/api/_content'

  describe('Locales', () => {
    test('Path with multiple locales', async () => {
      const params = { where: [{ _path: '/translated' }] }
      const content = await $fetch(`${apiBaseUrl}/query`, { params: { _params: JSON.stringify(params) } })
      expect(content.length === 2)
    })
  })
}
