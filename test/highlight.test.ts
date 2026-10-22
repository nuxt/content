import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('v3 `content.build.markdown.highlight`', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/highlight', import.meta.url)),
  })

  it('highlights code blocks with the configured light and dark themes', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('shiki')
    expect(html).toContain('github-light')
    // Dual themes: dark colors are emitted as CSS variables on every token.
    expect(html).toContain('--shiki-dark:')
    expect(html).toContain('answer')
  })
})
