import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { hash } from 'ohash'
import { jsonStringify } from '../../src/runtime/utils/json'

export const testNavigation = () => {
  describe('navigation', () => {
    test('Get navigation', async () => {
      const query = { where: [{ _locale: 'en' }] }
      const list = await $fetch(`/api/_content/navigation/${hash(query)}`, {
        params: {
          _params: jsonStringify(query)
        }
      })
      expect(list.find(item => item._path === '/')).toBeTruthy()
      expect(list.find(item => item._path === '/').children).toBeUndefined()
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

    test('Get numbers navigation', async () => {
      const query = { where: [{ _path: /^\/numbers/ }] }
      const list = await $fetch(`/api/_content/navigation/${hash(query)}`, {
        params: {
          _params: jsonStringify(query)
        }
      })

      expect(list[0]?.children).toBeDefined()

      const fibo = [1, 2, 3, 5, 8, 13, 21]
      list[0].children.forEach((item, index) => {
        expect(item.title).toEqual(String(fibo[index]))
      })
    })

    test('Should remove `navigation-disabled.md` content', async () => {
      const list = await $fetch('/api/_content/navigation/')
      const hidden = list.find(i => i._path === '/navigation-disabled')
      expect(hidden).toBeUndefined()
    })

    test('ContentNavigation should work with both QueryBuilder and QueryBuilderParams', async () => {
      /* These are local replicas of the queries made in `nav-with-query.vue` */
      const catsQuery = {
        where: {
          _path: /^\/cats/
        }
      }
      const numbersQuery = {
        where: {
          _path: /^\/numbers/
        }
      }
      const dogsQuery = {
        where: { _path: /^\/dogs/ }
      }

      const queryNav = async (query) => {
        const list = await $fetch(`/api/_content/navigation/${hash(query)}`, {
          params: {
            _params: jsonStringify(query)
          }
        })

        return list
      }

      const [catsData, numbersData, dogsData] = await Promise.all([
        queryNav(catsQuery),
        queryNav(numbersQuery),
        queryNav(dogsQuery)
      ])

      const html = await $fetch('/nav-with-query')

      catsData[0].children.forEach(({ title }) => expect(html).contains(title))
      numbersData[0].children.forEach(({ title }) => expect(html).contains(title))
      dogsData[0].children.forEach(({ title }) => expect(html).contains(title))
    })
  })
}
