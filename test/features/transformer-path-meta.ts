import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const testCases = {
  'content:3.index.md': {
    __description: 'Index file',
    title: '',
    _draft: false,
    _partial: false,
    _path: '/',
    _dir: ''
  },
  'content:3.index.draft.md': {
    __description: 'Index file with position [Draft]',
    title: '',
    _draft: true,
    _partial: false,
    _path: '/',
    _dir: ''
  },
  'content:1.blog:3.index.draft.md': {
    __description: 'Blog Index file with position [Draft]',
    title: '',
    _draft: true,
    _partial: false,
    _path: '/blog',
    _dir: ''
  },
  'content:1.blog:_4.the-post.md': {
    __description: 'Blog post file with position [Partial]',
    title: '4The Post',
    _draft: false,
    _partial: true,
    _path: '/blog/_4.the-post',
    _dir: 'blog'
  },
  ...['1.0.0', '1.1', '1', '1.x', '1.0.x', '1.0.0.x'].reduce((map, semver) => {
    map[`content:${semver}:doc.md`] = {
      title: 'Doc',
      _draft: false,
      _partial: false,
      _path: `/${semver}/doc`,
      _source: 'content',
      _dir: semver
    }
    return map
  }, {}),
  'content:1.one:2.two:3.three:4.four:5.five:doc.md': {
    __description: 'Position of nested directories (position will calculate with first three directory)',
    title: 'Doc',
    _draft: false,
    _partial: false,
    _path: '/one/two/three/four/five/doc',
    _dir: 'five'
  },
  'content:1.one:file?param=value#hash.md': {
    __description: 'Handle special chars in file name',
    title: 'File?param=value#hash',
    _draft: false,
    _partial: false,
    _path: '/one/fileparamvaluehash',
    _dir: 'one'
  },
  'content:indexer.md': {
    __description: 'non-index file with index substring',
    title: 'Indexer',
    _draft: false,
    _partial: false,
    _path: '/indexer',
    _dir: ''
  },
  'content:indexer.draft.md': {
    __description: 'non-index file with index substring',
    title: 'Indexer',
    _draft: true,
    _partial: false,
    _path: '/indexer',
    _dir: ''
  }
}

export const testPathMetaTransformer = () => {
  describe('Transformer (path-meta)', () => {
    Object.entries(testCases).forEach(([id, expected]) => {
      test(id, async () => {
        const transformed = await $fetch('/api/parse', {
          method: 'POST',
          body: { id, content: 'Index' }
        })

        const fullPath = id.replace(/:/g, '/')
        expect(transformed).toHaveProperty('_id')
        assert(
          transformed._id === id,
          `Id is not equal, expected: ${id}, actual: ${transformed._id}`
        )

        expect(transformed).toHaveProperty('_draft')
        assert(
          transformed._draft === expected._draft,
          `Draft is not equal, expected: ${expected._draft}, actual: ${transformed._draft}`
        )

        expect(transformed).toHaveProperty('_partial')
        assert(
          transformed._partial === expected._partial,
          `Partial is not equal, expected: ${expected._partial}, actual: ${transformed._partial}`
        )

        expect(transformed).toHaveProperty('_path')
        assert(
          transformed._path === expected._path,
          `Path is not equal, expected: ${expected._path}, actual: ${transformed._path}`
        )

        expect(transformed).toHaveProperty('_source')
        assert(
          fullPath.startsWith(`${transformed._source}/`),
          `source is not equal, recieved: ${transformed._source}`
        )

        expect(transformed).toHaveProperty('_dir')
        assert(
          transformed._dir === expected._dir,
          `directory is not equal, recieved: ${transformed._dir}`
        )

        expect(transformed).toHaveProperty('_path')
        assert(
          fullPath.startsWith(`${transformed._source}/${transformed._file}`),
          `file is not equal, recieved: ${transformed._file}`
        )

        expect(transformed).toHaveProperty('_extension')
        assert(
          fullPath.endsWith(`.${transformed._extension}`),
          `extension is not equal, recieved: ${transformed._extension}`
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
