import { fileURLToPath } from 'node:url'
import { afterEach, describe, it, expect } from 'vitest'
import { loadNuxt } from '@nuxt/kit'

const rootDir = fileURLToPath(new URL('./fixtures/live', import.meta.url))

describe('setup of a live content', () => {
  afterEach(() => {
    delete process.env.LIVE_FORM
  })

  it('fails in hybrid mode: the browser would read the snapshot written at build', async () => {
    await expect(loadNuxt({ cwd: rootDir, overrides: { content: { mode: 'hybrid' } } })).rejects.toThrow(/`live`.*`content\.mode: 'server-only'`/)
  })

  it('fails with `app/content.ts`: its browser instance would read the snapshot written at build', async () => {
    const layer = fileURLToPath(new URL('./fixtures/app-content/base-layer', import.meta.url))
    await expect(loadNuxt({ cwd: rootDir, overrides: { extends: [layer] } })).rejects.toThrow(/`live`.*`app\/content\.ts`/)
  })

  it('fails with a source that can\'t be pinned to a commit', async () => {
    process.env.LIVE_FORM = 'unpinnable'
    await expect(loadNuxt({ cwd: rootDir })).rejects.toThrow(/`live`.*pinned to a commit.*`site`/)
  })

  it('fails when a source has no `live.ref` function', async () => {
    process.env.LIVE_FORM = 'missing'
    await expect(loadNuxt({ cwd: rootDir })).rejects.toThrow(/`live\.ref`.*`site`/)
  })
})
