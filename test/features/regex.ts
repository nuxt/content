import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { hash } from 'ohash'
import { jsonStringify } from '../../src/runtime/utils/json'

export const testRegex = () => {
  describe('regex', () => {
    test('Get cats with regex', async () => {
      const params = { where: { $path: /^\/cats/ } }
      const list = await $fetch(`/api/_content/query/${hash(params)}`, {
        params: {
          _params: jsonStringify(params)
        }
      })

      expect(list.length).greaterThan(0)
      for (const item of list) {
        expect(item.$path).toMatch(/^\/cats/)
      }
    })

    test('Get cats navigation with regex', async () => {
      const params = { where: { $path: /^\/cats/ } }
      const list = await $fetch(`/api/_content/navigation/${hash(params)}`, {
        params: {
          _params: jsonStringify(params)
        }
      })

      expect(list.length).greaterThan(0)
      expect(list[0].$path).toEqual('/cats')

      for (const item of list[0].children) {
        expect(item.$path).toMatch(/^\/cats/)
      }
    })
  })
}
