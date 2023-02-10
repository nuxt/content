import { describe, expect, test, assert } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'

export const testLocales = () => {
  // @ts-ignore
  const apiBaseUrl = useTestContext().options.nuxtConfig.content?.api?.baseURL || '/api/_content'

  describe('Locales', () => {
    test('Path with multiple locales', async () => {
      const params = { where: [{ _path: '/translated' }] }
      const content = await $fetch(`${apiBaseUrl}/query`, { params: { _params: JSON.stringify(params) } })
      assert(content.length === 1)
      assert(content[0]._locale === 'en')
    })

    test('Search contents using `locale` helper', async () => {
      const fa = await $fetch('/locale-fa')

      expect(fa).toContain('fa-ir:fa:hello.md')
      expect(fa).not.toContain('content:index.md')

      const en = await $fetch('/locale-en')

      expect(en).not.toContain('fa-ir:fa:hello.md')
      expect(en).toContain('content:index.md')
    })

    test('Use default locale for unscoped contents', async () => {
      const index = await $fetch(`${apiBaseUrl}/query`, {
        params: {
          _params: JSON.stringify({ first: true, where: { _id: 'content:index.md' } })
        }
      })

      expect(index).toMatchObject({
        _locale: 'en'
      })
    })

    test('custom getLocaleFromPath helper', async () => {})
  })
}
