import { describe, it, expect, beforeAll } from 'vitest'
import { buildQuery, buildStyle, isRelativeAsset, parseQuery, removeOrdering, removeQuery } from '../../src/utils/assets/paths'
import { setAssetExtensions } from '../../src/utils/assets/state'
import { DEFAULT_ASSET_EXTENSIONS } from '../../src/utils/assets/shared'

describe('assets/paths', () => {
  beforeAll(() => setAssetExtensions(DEFAULT_ASSET_EXTENSIONS))

  it('removeOrdering strips `NN.` from every segment, including the file name', () => {
    expect(removeOrdering('1.foo/bar.jpg')).toBe('foo/bar.jpg')
    expect(removeOrdering('1.foo/2.bar/baz.jpg')).toBe('foo/bar/baz.jpg')
    expect(removeOrdering('foo/bar.jpg')).toBe('foo/bar.jpg')
    expect(removeOrdering('foo/1.bar.jpg')).toBe('foo/bar.jpg')
  })

  it('removeQuery / parseQuery', () => {
    expect(removeQuery('a/b.png?x=1')).toBe('a/b.png')
    expect(removeQuery('a/b.png')).toBe('a/b.png')
    expect(parseQuery('a/b.png?x=1')).toBe('?x=1')
    expect(parseQuery('a/b.png')).toBe('')
  })

  it('isRelativeAsset accepts relative asset paths only', () => {
    expect(isRelativeAsset('media/photo.png')).toBe(true)
    expect(isRelativeAsset('./media/photo.png')).toBe(true)
    expect(isRelativeAsset('../media/photo.png')).toBe(true)
    expect(isRelativeAsset('files/doc.pdf')).toBe(true)
    expect(isRelativeAsset('/media/photo.png')).toBe(false)
    expect(isRelativeAsset('https://example.com/a.png')).toBe(false)
    expect(isRelativeAsset('data:image/png;base64,xxxx')).toBe(false)
    expect(isRelativeAsset('#anchor')).toBe(false)
    expect(isRelativeAsset('media/article.md')).toBe(false)
    expect(isRelativeAsset(42)).toBe(false)
  })

  it('buildStyle joins independent declarations', () => {
    expect(buildStyle('color: red', 'aspect-ratio: 16/9')).toBe('color: red; aspect-ratio: 16/9;')
    expect(buildStyle('', 'aspect-ratio: 1/1')).toBe('aspect-ratio: 1/1;')
  })

  it('buildQuery merges path and params', () => {
    expect(buildQuery('/img.png', 'width=10&height=20')).toBe('/img.png?width=10&height=20')
    expect(buildQuery('/img.png?a=1', 'width=10')).toBe('/img.png?a=1&width=10')
    expect(buildQuery('width=10', 'height=20')).toBe('?width=10&height=20')
  })
})
