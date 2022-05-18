import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { hash } from 'ohash'
import { jsonStringify } from '../../src/runtime/utils/json'

export const testNavigation = () => {
  describe('navigation', () => {
    test('Get navigation', async () => {
      const list = await $fetch('/api/_content/navigation/')

      expect(list).toMatchSnapshot('basic-navigation')
    })

    test('Get cats navigation', async () => {
      const query = { where: [{ _path: /^\/cats/ }] }
      const list = await $fetch(`/api/_content/navigation/${hash(query)}`, {
        params: {
          _params: jsonStringify(query)
        }
      })

      expect(list).toMatchSnapshot('basic-navigation-cats')
    })

    test('Get dogs navigation', async () => {
      const query = { where: [{ _path: /^\/dogs/ }] }
      const list = await $fetch(`/api/_content/navigation/${hash(query)}`, {
        params: {
          _params: jsonStringify(query)
        }
      })

      expect(list).toMatchSnapshot('basic-navigation-dogs')
    })
  })
}
