import { describe, test, expect, assert } from 'vitest'
import plugin from '../../src/runtime/server/transformer/plugin-path-meta'
import type { ParsedContent, ParsedContentMeta } from '../../src/runtime/types'

const matchMeta = (transformed: any, expected: any) => {
  expect(transformed).toHaveProperty('meta.id')
  assert(
    transformed.meta.id === expected.id,
    `Id is not equal, expected: ${expected.id}, actual: ${transformed.meta.id}`
  )

  expect(transformed).toHaveProperty('meta.draft')
  assert(
    transformed.meta.draft === expected.draft,
    `Draft is not equal, expected: ${expected.draft}, actual: ${transformed.meta.draft}`
  )

  expect(transformed).toHaveProperty('meta.partial')
  assert(
    transformed.meta.partial === expected.partial,
    `Partial is not equal, expected: ${expected.partial}, actual: ${transformed.meta.partial}`
  )

  expect(transformed).toHaveProperty('meta.slug')
  assert(
    transformed.meta.slug === expected.slug,
    `Slug is not equal, expected: ${expected.slug}, actual: ${transformed.meta.slug}`
  )

  expect(transformed).toHaveProperty('meta.position')
  assert(
    transformed.meta.position === expected.position,
    `Position is not equal, expected: ${expected.position}, actual: ${transformed.meta.position}`
  )

  expect(transformed).toHaveProperty('meta.title')
  assert(
    transformed.meta.title === expected.title,
    `Title is not equal, expected: ${expected.title}, actual: ${transformed.meta.title}`
  )
}

describe('Path Meta Plugin', () => {
  test('Index file', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:index.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.meta.id,
      draft: false,
      partial: false,
      slug: '/',
      position: '999900000000'
    })
  })

  test('Index file with position', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:3.index.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.meta.id,
      draft: false,
      partial: false,
      slug: '/',
      position: '000300000000'
    })
  })

  test('Index file with position [Draft]', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:3.index.draft.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.meta.id,
      draft: true,
      partial: false,
      slug: '/',
      position: '000300000000'
    })
  })

  test('Blog Index file with position [Draft]', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:1.blog:3.index.draft.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: '',
      id: transformed.meta.id,
      draft: true,
      partial: false,
      slug: '/blog',
      position: '000100030000'
    })
  })

  test('Blog post file with position [Partial]', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:1.blog:_4.the-post.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'The Post',
      id: transformed.meta.id,
      draft: false,
      partial: true,
      slug: '/blog/the-post',
      position: '000100040000'
    })
  })

  test('Semver directory', () => {
    const semvers = ['1.0.0', '1.1', '1', '1.x', '1.0.x', '1.0.0.x']

    semvers.forEach((semver) => {
      const transformed = plugin.transform!({
        meta: { id: `content:${semver}:doc.md` } as ParsedContentMeta,
        body: '# Index'
      }) as ParsedContent

      matchMeta(transformed, {
        title: 'Doc',
        id: transformed.meta.id,
        draft: false,
        partial: false,
        slug: `/${semver}/doc`,
        position: '999999990000'
      })
    })
  })

  test('Position of nested directories (position will calculate with first three directory)', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:1.one:2.two:3.three:4.four:5.five:doc.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'Doc',
      id: transformed.meta.id,
      draft: false,
      partial: false,
      slug: '/one/two/three/four/five/doc',
      position: '000100020003'
    })
  })

  test('Handle special chars in file name', () => {
    const transformed = plugin.transform!({
      meta: { id: 'content:1.one:file?param=value#hash.md' } as ParsedContentMeta,
      body: '# Index'
    }) as ParsedContent

    matchMeta(transformed, {
      title: 'File?param=value#hash',
      id: transformed.meta.id,
      draft: false,
      partial: false,
      slug: '/one/fileparamvaluehash',
      position: '000199990000'
    })
  })
})
