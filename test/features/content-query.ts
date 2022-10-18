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
      const content = await $fetch('/features/query-content?path=/prefix/foo&findOne=1')

      // empty
      expect(content).includes('$$$$')
    })

    // test `queryContent( PREFIX ).findOne()`
    test('exact match foo/bar found', async () => {
      const content = await $fetch('/features/query-content?path=/prefix/foo/bar&findOne=1')

      // empty
      expect(content).includes('prefix:foo:bar.md$$')
    })

    // test `queryContent( PREFIX ).find()`
    test('prefix queries', async () => {
      const content = await $fetch('/features/query-content?path=/prefix/foo')

      expect(content).includes('prefix:foo:bar.md')
      expect(content).includes('prefix:foo:baz.md')
      expect(content).includes('prefix:foobarbaz.md')
    })

    // test `queryContent( PREFIX ).find()` with trailing slash
    test('directory listing', async () => {
      const content = await $fetch('/features/query-content?path=/prefix/foo/')

      expect(content).includes('prefix:foo:bar.md')
      expect(content).includes('prefix:foo:baz.md')
      expect(content).not.includes('prefix:foobarbaz.md')
    })

    // test `queryContent( PREFIX ).where( CONDITION ).find()`
    test('list contents with tag', async () => {
      const content = await $fetch('/features/query-content?where={"tags": { "$contains": "mdc" } }')

      expect(content).includes(':mdc-props-inline.md')
      expect(content).includes(':mdc-props.md')
    })

    // test `queryContent( PREFIX ).where( CONDITION ).findOne()`
    test('find contents with tag', async () => {
      const content = await $fetch('/features/query-content?where={"tags": { "$contains": "mdc" } }&findOne=1')

      expect(content).includes(':mdc-props-inline.md')
      expect(content).not.includes(':mdc-props.md')
    })

    // test `queryContent().where( CONDITION ).find()`
    test('find contents with tag', async () => {
      const content = await $fetch('/features/query-content?prefix=&where={"tags": { "$contains": "mdc" } }')

      expect(content).includes(':mdc-props-inline.md')
      expect(content).includes(':mdc-props.md')
    })

    // test `queryContent().where( CONDITION ).findOne()`
    test('find contents with tag', async () => {
      const content = await $fetch('/features/query-content?prefix=&where={"tags": { "$contains": "mdc" } }&findOne=1')

      expect(content).includes(':mdc-props-inline.md')
      expect(content).not.includes(':mdc-props.md')
    })
  })
}
