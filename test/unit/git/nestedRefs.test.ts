import { describe, expect, test, vi } from 'vitest'

vi.mock('isomorphic-git', () => ({
  default: {
    getRemoteInfo: vi.fn(async () => ({
      HEAD: 'refs/heads/main',
      refs: {
        heads: {
          main: 'aaa',
          release: { 'v4.0.0': 'bbb' },
        },
        tags: {
          'v1.0': { beta: 'ccc' },
        },
      },
    })),
  },
}))

const { getGitRemoteHash } = await import('../../../src/utils/git')

describe('getGitRemoteHash with nested refs', () => {
  test('resolves a branch name containing a slash', async () => {
    const url = 'https://github.com/nuxt/content'
    const ref = { branch: 'release/v4.0.0' }

    expect(await getGitRemoteHash(url, ref)).toBe('bbb')
    expect(await getGitRemoteHash(url, ref)).toBe('bbb')
  })

  test('resolves a tag name containing a slash', async () => {
    expect(await getGitRemoteHash('https://github.com/nuxt/content', { tag: 'v1.0/beta' })).toBe('ccc')
  })

  test('does not return an object for a partial ref', async () => {
    expect(await getGitRemoteHash('https://github.com/nuxt/content', { branch: 'release' })).toBeUndefined()
  })
})
