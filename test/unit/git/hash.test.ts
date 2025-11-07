import { expect, describe, test } from 'vitest'
import { getGitRemoteHash } from '../../../src/utils/git'

describe('getGitRemoteHash', () => {
  test('get remote hash with defaults', async () => {
    const url = 'https://github.com/nuxt/content'
    const hash = await getGitRemoteHash(url)

    expect(hash).not.toBeUndefined()
  })

  test('get remote hash with branch', async () => {
    const url = 'https://github.com/nuxt/content'
    const ref = { branch: 'v1' }
    const hash = await getGitRemoteHash(url, ref)

    expect(hash).not.toBeUndefined()
  })

  test('get remote hash with git tag', async () => {
    const url = 'https://github.com/nuxt/content'
    const ref = { tag: 'v3.7.0' }
    const hash = await getGitRemoteHash(url, ref)

    expect(hash).not.toBeUndefined()
  })

  test('do not get remote hash from nonexistent repo', async () => {
    const url = 'https://github.com/fake/repo'
    const hash = await getGitRemoteHash(url)

    expect(hash).toBeUndefined()
  })
})
