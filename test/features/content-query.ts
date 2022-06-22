import { describe, expect, test } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testContentQuery = () => {
  describe('Content Queries', () => {
    test('Find index', async () => {
      const content = await $fetch('/')

      // Normal Prop
      expect(content).includes('Index')
    })

    test('exact match foo not found', async () => {
      const content = await $fetch('/features/query-content?path=/foo&findOne=1')

      // empty
      expect(content).includes('$$$$')
    })

    test('exact match foo/bar found', async () => {
      const content = await $fetch('/features/query-content?path=/foo/bar&findOne=1')

      // empty
      expect(content).includes('prefix:foo:bar.md$$')
    })

    test('prefix queries', async () => {
      const content = await $fetch('/features/query-content?path=/foo')

      expect(content).includes('prefix:foo:bar.md')
      expect(content).includes('prefix:foo:baz.md')
      expect(content).includes('prefix:foobarbaz.md')
    })

    test('directory listing', async () => {
      const content = await $fetch('/features/query-content?path=/foo/')

      expect(content).includes('prefix:foo:bar.md')
      expect(content).includes('prefix:foo:baz.md')
      expect(content).not.includes('prefix:foobarbaz.md')
    })
  })
}
