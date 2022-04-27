import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { encodeApiParams } from '../../src/runtime/utils'

export const testNavigation = () => {
  describe('navigation', () => {
    test('Get navigation', async () => {
      const list = await $fetch('/api/_content/navigation/')

      expect(list).toMatchSnapshot('basic-navigation')
    })

    test('Get cats navigation', async () => {
      const list = await $fetch(`/api/_content/navigation/${encodeApiParams({ slug: '/cats' })}`)

      expect(list).toMatchSnapshot('basic-navigation-cats')
    })

    test('Get cats navigation', async () => {
      const list = await $fetch(`/api/_content/navigation/${encodeApiParams({ slug: '/dogs' })}`)

      expect(list).toMatchSnapshot('basic-navigation-dogs')
    })
  })
}
