import { describe, test, expect, assert } from 'vitest'
import { z } from 'zod'
import { parseContent } from '../utils/content'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { initiateValidatorsContext } from '../../src/utils/dependencies'

const testCases = {
  'content:3.index.md': {
    __description: 'Index file',
    title: '',
    path: '/',
    extension: 'md',
    stem: '3.index',
  },
  'content:3.index.draft.md': {
    __description: 'Index file with position [Draft]',
    title: '',
    path: '/',
    extension: 'md',
    stem: '3.index.draft',
  },
  'content:1.blog:3.index.draft.md': {
    __description: 'Blog Index file with position [Draft]',
    title: '',
    path: '/blog',
    extension: 'md',
    stem: '1.blog/3.index.draft',
  },
  'content:1.blog:_4.the-post.md': {
    __description: 'Blog post file with position [Partial]',
    title: '4The Post',
    path: '/blog/_4.the-post',
    extension: 'md',
    stem: '1.blog/_4.the-post',
  },
  ...['1.0.0', '1.1', '1', '1.x', '1.0.x', '1.0.0.x'].reduce((map, semver) => {
    map[`content:${semver}:doc.md`] = {
      title: 'Doc',
      path: `/${semver}/doc`,
      extension: 'md',
      stem: `${semver}/doc`,
    }
    return map
  }, {} as Record<string, unknown>),
  'content:1.one:2.two:3.three:4.four:5.five:doc.md': {
    __description: 'Position of nested directories (position will calculate with first three directory)',
    title: 'Doc',
    path: '/one/two/three/four/five/doc',
    extension: 'md',
    stem: '1.one/2.two/3.three/4.four/5.five/doc',
  },
  'content:1.one:file?param=value#hash.md': {
    __description: 'Handle special chars in file name',
    title: 'File?param=value#hash',
    path: '/one/fileparamvaluehash',
    extension: 'md',
    stem: '1.one/file?param=value#hash',
    _dir: 'one',
  },
  'content:indexer.md': {
    __description: 'non-index file with index substring',
    title: 'Indexer',
    path: '/indexer',
    extension: 'md',
    stem: 'indexer',
  },
  'content:indexer.draft.md': {
    __description: 'non-index file with index substring',
    title: 'Indexer',
    path: '/indexer',
    extension: 'md',
    stem: 'indexer.draft',
  },
  'content/فرهنگ/فارسی/فرهنگ.md': {
    __description: 'Handle special chars in file name',
    title: 'فرهنگ',
    path: '/frhng/farsy/frhng',
    extension: 'md',
    stem: 'فرهنگ/فارسی/فرهنگ',
  },
}

describe('Transformer (path-meta)', async () => {
  await initiateValidatorsContext()

  const collection = resolveCollection('content', defineCollection({
    type: 'page',
    source: 'content/**',
    schema: z.object({
    }),
  }))!

  Object.entries(testCases).forEach(([id, expected]) => {
    test(id, async () => {
      const fullPath = id.replace(/:/g, '/')
      const transformed = await parseContent(fullPath, 'Index', collection)

      expect(transformed).toHaveProperty('id')
      assert(
        transformed.id === fullPath,
        `Id is not equal, expected: ${id}, actual: ${transformed.id}`,
      )

      expect(transformed).toHaveProperty('stem')
      assert(
        transformed.stem === expected.stem,
        `Draft is not equal, expected: ${expected.stem}, actual: ${transformed.stem}`,
      )

      expect(transformed).toHaveProperty('extension')
      assert(
        transformed.extension === expected.extension,
        `Partial is not equal, expected: ${expected.extension}, actual: ${transformed.extension}`,
      )

      expect(transformed).toHaveProperty('path')

      assert(
        transformed.path === expected.path,
        `Path is not equal, expected: ${expected.path}, actual: ${transformed.path}`,
      )

      expect(transformed).toHaveProperty('extension')
      assert(
        fullPath.endsWith(`.${transformed.extension}`),
        `extension is not equal, received: ${transformed.extension}`,
      )

      expect(transformed).toHaveProperty('title')
      assert(
        transformed.title === expected.title,
        `Title is not equal, expected: ${expected.title}, actual: "${transformed.title}"`,
      )
    })
  })
})
