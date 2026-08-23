import { describe, expect, it, vi } from 'vitest'
import { defineGitSource } from '../../src/utils/source'

vi.mock('../../src/utils/git', () => ({
  downloadGitRepository: vi.fn(),
}))

async function resolveCwd(repository: string | Record<string, unknown>) {
  const source = defineGitSource({ include: 'docs/**', repository } as never)
  await source.prepare!({ rootDir: '/root' } as never)
  return source.cwd
}

describe('defineGitSource', () => {
  it('keys the checkout directory on the resolved ref', async () => {
    expect(await resolveCwd('https://github.com/nuxt/cli/tree/main'))
      .toBe('/root/.data/content/github.com-nuxt-cli-main')
    expect(await resolveCwd({ url: 'https://github.com/nuxt/cli', tag: 'v3.37.0' }))
      .toBe('/root/.data/content/github.com-nuxt-cli-v3.37.0')
    expect(await resolveCwd({ url: 'https://github.com/nuxt/cli', branch: 'dev' }))
      .toBe('/root/.data/content/github.com-nuxt-cli-dev')
  })

  it('defaults to main when no ref is given', async () => {
    expect(await resolveCwd('https://github.com/nuxt/cli'))
      .toBe('/root/.data/content/github.com-nuxt-cli-main')
  })
})
