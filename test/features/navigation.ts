import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { hash } from 'ohash'

export const testNavigation = () => {
  describe('navigation', () => {
    test('Get navigation', async () => {
      const list = await $fetch('/api/_content/navigation/')

      expect(list).toMatchSnapshot('basic-navigation')
    })

    test('Get cats navigation', async () => {
      const list = await $fetch(`/api/_content/navigation/${hash({ slug: '/cats' })}`, {
        params: {
          params: JSON.stringify({ slug: '/cats' })
        }
      })

      expect(list).toMatchSnapshot('basic-navigation-cats')
    })

    test('Get dogs navigation', async () => {
      const list = await $fetch(`/api/_content/navigation/${hash({ slug: '/dogs' })}`, {
        params: {
          params: JSON.stringify({ slug: '/dogs' })
        }
      })

      expect(list).toMatchSnapshot('basic-navigation-dogs')
    })
  })
}
