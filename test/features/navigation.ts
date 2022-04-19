import { describe, test, expect } from 'vitest'
import { fromByteArray } from 'base64-js'
import { $fetch } from '@nuxt/test-utils'

export const testNavigation = () => {
  describe('navigation', () => {
    test('Get navigation', async () => {
      const list = await $fetch('/api/_content/navigation/')

      expect(list).toMatchSnapshot('basic-navigation')
    })

    test('Get cats navigation', async () => {
      const params = fromByteArray(Array.from(JSON.stringify({ slug: '/cats' })).map(c => c.charCodeAt(0)) as any)
      const list = await $fetch(`/api/_content/navigation/${params}`)

      expect(list).toMatchSnapshot('basic-navigation-cats')
    })

    test('Get cats navigation', async () => {
      const params = fromByteArray(Array.from(JSON.stringify({ slug: '/dogs' })).map(c => c.charCodeAt(0)) as any)
      const list = await $fetch(`/api/_content/navigation/${params}`)

      expect(list).toMatchSnapshot('basic-navigation-dogs')
    })
  })
}
