import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const { getRemoteInfo, clone } = vi.hoisted(() => ({
  getRemoteInfo: vi.fn(),
  clone: vi.fn(async () => {}),
}))

vi.mock('isomorphic-git', () => ({ default: { getRemoteInfo, clone } }))

const { downloadGitRepository } = await import('../../../src/utils/git')

const url = 'https://github.com/owner/private-repo'

describe('downloadGitRepository with a private repository', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'content-git-'))
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true })
  })

  test('sends credentials when it reads the remote hash', async () => {
    // A private repository rejects requests that have no credentials
    getRemoteInfo.mockImplementation(async ({ url }: { url: string }) => {
      if (!new URL(url).password) throw new Error('HTTP Error: 401 Unauthorized')
      return { HEAD: 'refs/heads/main', refs: { heads: { main: 'aaa' } } }
    })

    await downloadGitRepository(url, cwd, { token: 'secret' })

    const cache = JSON.parse(await readFile(join(cwd, '.content.cache.json'), 'utf8'))
    expect(cache.hash).toBe('aaa')
    expect(cache.url).toBe(url)

    await downloadGitRepository(url, cwd, { token: 'secret' })
    expect(clone).toHaveBeenCalledTimes(1)
  })

  test('downloads again when the remote hash is unknown', async () => {
    getRemoteInfo.mockRejectedValue(new Error('HTTP Error: 401 Unauthorized'))

    await downloadGitRepository(url, cwd)
    await downloadGitRepository(url, cwd)

    expect(clone).toHaveBeenCalledTimes(2)
  })
})
