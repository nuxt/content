import { describe, expect, test, assert } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'
import { hash } from 'ohash'

export const testContentQuery = () => {
  // @ts-ignore
  const apiBaseUrl = useTestContext().options.nuxtConfig.content?.api?.baseURL || '/api/_content'

  describe('Content Queries', () => {
    const fetchDocument = (_id: string) => {
      const params = { first: true, where: { _id } }
      const qid = hash(params)
      return $fetch(`${apiBaseUrl}/query/${qid}`, {
        params: { _params: JSON.stringify(params) }
      })
    }
    test('List contents', async () => {
      const params = { only: '_id' }
      const qid = hash(params)
      const docs = await $fetch(`${apiBaseUrl}/query/${qid}`, {
        params: { _params: JSON.stringify(params) }
      })

      const ids = docs.map((doc: any) => doc._id)

      assert(ids.length > 0)
      assert(ids.includes('content:index.md'))

      // Ignored files should be listed
      assert(ids.includes('content:.dot-ignored.md') === false, 'Ignored files with `.` should not be listed')
      assert(ids.includes('content:-dash-ignored.md') === false, 'Ignored files with `-` should not be listed')

      assert(ids.includes('fa-ir:fa:hello.md') === false, 'Files with `fa-ir` prefix should be listed')
    })

    test('Get contents index', async () => {
      const index = await fetchDocument('content:index.md')

      expect(index).toHaveProperty('body')

      expect(index.body).toMatchSnapshot('basic-index-body')
    })

    test('Get ignored contents', async () => {
      const ignored = await fetchDocument('content:.dot-ignored.md').catch(_err => null)

      expect(ignored).toBeNull()
    })

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

    test('find `_path` and explude `index`', async () => {
      const content = await $fetch('/features/query-content?prefix=&path=/cats&where={"_path":{"$ne":"/cats"}}')

      expect(content).not.includes('cats:index.md')
      expect(content).includes('cats:_dir.yml')
      expect(content).includes('cats:bombay.md')
      expect(content).includes('cats:persian.md')
      expect(content).includes('cats:ragdoll.md')
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
