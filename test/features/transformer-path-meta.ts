import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const testCases = {
  'content:3.index.md': {
    __description: 'Index file',
    title: '',
    draft: false,
    partial: false,
    path: '/'
  },
  'content:3.index.draft.md': {
    __description: 'Index file with position [Draft]',
    title: '',
    draft: true,
    partial: false,
    path: '/'
  },
  'content:1.blog:3.index.draft.md': {
    __description: 'Blog Index file with position [Draft]',
    title: '',
    draft: true,
    partial: false,
    path: '/blog'
  },
  'content:1.blog:_4.the-post.md': {
    __description: 'Blog post file with position [Partial]',
    title: 'The Post',
    draft: false,
    partial: true,
    path: '/blog/the-post'
  },
  ...['1.0.0', '1.1', '1', '1.x', '1.0.x', '1.0.0.x'].reduce((map, semver) => {
    map[`content:${semver}:doc.md`] = {
      title: 'Doc',
      draft: false,
      partial: false,
      path: `/${semver}/doc`,
      source: 'content',
      path: `${semver}/doc.md`
    }
    return map
  }, {}),
  'content:1.one:2.two:3.three:4.four:5.five:doc.md': {
    __description: 'Position of nested directories (position will calculate with first three directory)',
    title: 'Doc',
    draft: false,
    partial: false,
    path: '/one/two/three/four/five/doc'
  },
  'content:1.one:file?param=value#hash.md': {
    __description: 'Handle special chars in file name',
    title: 'File?param=value#hash',
    draft: false,
    partial: false,
    path: '/one/fileparamvaluehash'
  }
}

export const testPathMetaTransformer = () => {
  describe('transformer:path-meta', () => {
    Object.entries(testCases).forEach(([id, expected]) => {
      test(id, async () => {
        const transformed = await $fetch('/api/parse', {
          method: 'POST',
          body: { id, content: 'Index' }
        })

        const fullPath = id.replace(/:/g, '/')
        expect(transformed).toHaveProperty('id')
        assert(
          transformed.id === id,
          `Id is not equal, expected: ${id}, actual: ${transformed.id}`
        )

        expect(transformed).toHaveProperty('draft')
        assert(
          transformed.draft === expected.draft,
          `Draft is not equal, expected: ${expected.draft}, actual: ${transformed.draft}`
        )

        expect(transformed).toHaveProperty('partial')
        assert(
          transformed.partial === expected.partial,
          `Partial is not equal, expected: ${expected.partial}, actual: ${transformed.partial}`
        )

        expect(transformed).toHaveProperty('path')
        assert(
          transformed.path === expected.path,
          `Path is not equal, expected: ${expected.path}, actual: ${transformed.path}`
        )

        expect(transformed).toHaveProperty('source')
        assert(
          fullPath.startsWith(`${transformed.source}/`),
          `source is not equal, recieved: ${transformed.source}`
        )

        expect(transformed).toHaveProperty('path')
        assert(
          fullPath.startsWith(`${transformed.source}/${transformed.path}`),
          `path is not equal, recieved: ${transformed.path}`
        )
        expect(transformed).toHaveProperty('extension')
        assert(
          fullPath.startsWith(`${transformed.source}/${transformed.path}.${transformed.extension}`),
          `extension is not equal, recieved: ${transformed.path}`
        )

        expect(transformed).toHaveProperty('title')
        assert(
          transformed.title === expected.title,
          `Title is not equal, expected: ${expected.title}, actual: ${transformed.title}`
        )
      })
    })
  })
}
