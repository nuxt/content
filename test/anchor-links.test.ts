import { describe, expect, it } from 'vitest'
import { resolveAnchorLinks } from '../src/utils/anchor-links'

describe('resolveAnchorLinks', () => {
  it('links h2 to h4 by default, like v3', () => {
    expect(resolveAnchorLinks(undefined)).toEqual(['h2', 'h3', 'h4'])
  })

  it('merges an object with the v3 default', () => {
    expect(resolveAnchorLinks({ h2: false, h5: true })).toEqual(['h3', 'h4', 'h5'])
  })

  it('links every level with `true` and none with `false`', () => {
    expect(resolveAnchorLinks(true)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    expect(resolveAnchorLinks(false)).toEqual([])
  })
})
