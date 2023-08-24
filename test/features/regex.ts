import { describe, test, expect } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'
import { hash } from 'ohash'
import { jsonStringify } from '../../src/runtime/utils/json'

export const testRegex = () => {
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
  describe('Regex queries', () => {
    test('Get cats with regex', async () => {
      const params = { where: { _path: /^\/cats/ } }
      const list = await $fetch(`${apiBaseUrl}/query/${hash(params)}`, {
        params: {
          _params: jsonStringify(params)
        }
      }).then(resolveResult)

      expect(list.length).greaterThan(0)
      for (const item of list) {
        expect(item._path).toMatch(/^\/cats/)
      }
    })

    test('Get cats navigation with regex', async () => {
      const params = { where: { _path: /^\/cats/ } }
      const list = await $fetch(`${apiBaseUrl}/navigation/${hash(params)}`, {
        params: {
          _params: jsonStringify(params)
        }
      })

      expect(list.length).greaterThan(0)
      expect(list[0]._path).toEqual('/cats')

      for (const item of list[0].children) {
        expect(item._path).toMatch(/^\/cats/)
      }
    })
  })
}
