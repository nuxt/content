import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, getServerLogs, stopServer } from '@nuxt/test-utils/e2e'

describe('dev', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    dev: true,
  })

  // Dev requests reach the module process, which has no snapshot to load: it reads the source.
  it('reads a document from the source without a snapshot warning', async () => {
    const doc = await $fetch<{ meta: { title: string } }>('/__nuxt_content/get/')
    expect(doc.meta.title).toBe('Hello')
    expect(getServerLogs().join('\n')).not.toContain('loading the parsed snapshot for "content" failed')
  })

  // Rollup warns about every unused auto-import of an external module when `#imports` is imported dynamically.
  // Keep this test last: it stops the server to flush its output.
  it('builds the Nitro server without unused import warnings', async () => {
    await stopServer()
    expect(getServerLogs().join('\n')).not.toContain('but never used in')
  })
})
