import { describe, expect, it } from 'vitest'
import micromatch from 'micromatch'
import { getExcludedSourcePaths } from '../../src/utils/source'
import type { CollectionSource } from '../../src/types/collection'

function isIncluded(path: string, source: CollectionSource = { include: '**' }) {
  return micromatch.isMatch(path, source.include, {
    ignore: getExcludedSourcePaths(source),
    dot: true,
  })
}

describe('getExcludedSourcePaths', () => {
  it('includes user excludes and default OS ignore', () => {
    expect(getExcludedSourcePaths({ include: '**', exclude: ['drafts/**'] })).toEqual([
      'drafts/**',
      '**/.DS_Store',
      '**/*.tmp',
      '**/*.tmp.*',
      '**/*~',
      '**/.#*',
      '**/~*',
    ])
  })

  it('keeps normal content files', () => {
    expect(isIncluded('index.md')).toBe(true)
    expect(isIncluded('blog/hello-world.md')).toBe(true)
    expect(isIncluded('data.json')).toBe(true)
    expect(isIncluded('config.yaml')).toBe(true)
  })

  it('ignores temporary editor and tool files', () => {
    // Common non-atomic write temps (e.g. example.md.tmp.153372)
    expect(isIncluded('example.md.tmp')).toBe(false)
    expect(isIncluded('example.md.tmp.153372')).toBe(false)
    expect(isIncluded('blog/post.md.tmp.1')).toBe(false)
    expect(isIncluded('foo.tmp.swp')).toBe(false)

    // Vim backup files
    expect(isIncluded('index.md~')).toBe(false)
    expect(isIncluded('blog/post.md~')).toBe(false)

    // Emacs lock / autosave files
    expect(isIncluded('.#index.md')).toBe(false)
    expect(isIncluded('blog/.#post.md')).toBe(false)
    expect(isIncluded('~index.md')).toBe(false)
    expect(isIncluded('blog/~post.md')).toBe(false)

    // OS files
    expect(isIncluded('.DS_Store')).toBe(false)
    expect(isIncluded('blog/.DS_Store')).toBe(false)
  })

  it('respects custom exclude patterns', () => {
    const source: CollectionSource = {
      include: '**',
      exclude: ['drafts/**', '**/*.draft.md'],
    }

    expect(isIncluded('drafts/wip.md', source)).toBe(false)
    expect(isIncluded('page.draft.md', source)).toBe(false)
    expect(isIncluded('page.md', source)).toBe(true)
  })
})
