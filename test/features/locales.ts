import { describe, expect, test, assert } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'

export const testLocales = () => {
  // @ts-ignore
  const apiBaseUrl = useTestContext().options.nuxtConfig.content?.api?.baseURL || '/api/_content'
  const resolveResult = (result: any) => {
    if (!useTestContext().options.nuxtConfig.content?.experimental?.advanceQuery) {
      if (result?.surround) {
        return result.surround
      }

      return result?._id || Array.isArray(result) ? result : result?.result
    }

    return result.result
  }
  describe('Locales', () => {
    test('Path with multiple locales', async () => {
      const params = { where: [{ _path: '/translated' }] }
      const content = await $fetch(`${apiBaseUrl}/query`, { params: { _params: JSON.stringify(params) } }).then(resolveResult)
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
      }).then(resolveResult)

      expect(index).toMatchObject({
        _locale: 'en'
      })
    })
  })
}
