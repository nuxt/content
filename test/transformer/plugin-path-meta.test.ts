import { describe, test, expect, assert } from 'vitest'
import plugin from '../../src/runtime/server/transformer/path-meta'
import type { ParsedContent } from '../../src/runtime/types'

const matchMeta = (transformed: any, expected: any) => {
  const fullPath = expected.id.replace(/:/g, '/')
  expect(transformed).toHaveProperty('id')
  assert(
    transformed.id === expected.id,
    `Id is not equal, expected: ${expected.id}, actual: ${transformed.id}`
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

  expect(transformed).toHaveProperty('slug')
  assert(
    transformed.slug === expected.slug,
    `Slug is not equal, expected: ${expected.slug}, actual: ${transformed.slug}`
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
}

describe('Path Meta Plugin', () => {
  test('Index file', () => {
    const transformed = plugin.transform!({
      id: 'content:3.index.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.id,
      draft: false,
      partial: false,
      slug: '/'
    })
  })

  test('Index file with position [Draft]', () => {
    const transformed = plugin.transform!({
      id: 'content:3.index.draft.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.id,
      draft: true,
      partial: false,
      slug: '/'
    })
  })

  test('Blog Index file with position [Draft]', () => {
    const transformed = plugin.transform!({
      id: 'content:1.blog:3.index.draft.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.id,
      draft: true,
      partial: false,
      slug: '/blog'
    })
  })

  test('Blog post file with position [Partial]', () => {
    const transformed = plugin.transform!({
      id: 'content:1.blog:_4.the-post.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'The Post',
      id: transformed.id,
      draft: false,
      partial: true,
      slug: '/blog/the-post'
    })
  })

  test('Semver directory', () => {
    const semvers = ['1.0.0', '1.1', '1', '1.x', '1.0.x', '1.0.0.x']

    semvers.forEach((semver) => {
      const transformed = plugin.transform!({
        id: `content:${semver}:doc.md`,
        body: '# Index'
      }) as ParsedContent

      matchMeta(transformed, {
        title: 'Doc',
        id: transformed.id,
        draft: false,
        partial: false,
        slug: `/${semver}/doc`,
        source: 'content',
        path: `${semver}/doc.md`
      })
    })
  })

  test('Position of nested directories (position will calculate with first three directory)', () => {
    const transformed = plugin.transform!({
      id: 'content:1.one:2.two:3.three:4.four:5.five:doc.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'Doc',
      id: transformed.id,
      draft: false,
      partial: false,
      slug: '/one/two/three/four/five/doc'
    })
  })

  test('Handle special chars in file name', () => {
    const transformed = plugin.transform!({
      id: 'content:1.one:file?param=value#hash.md',
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'File?param=value#hash',
      id: transformed.id,
      draft: false,
      partial: false,
      slug: '/one/fileparamvaluehash'
    })
  })
})
