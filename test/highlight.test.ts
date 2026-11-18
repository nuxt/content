import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('v3 `content.build.markdown.highlight`', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/highlight', import.meta.url)),
    browser: true,
  })

  it('highlights code blocks with the configured light and dark themes', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('shiki')
    expect(html).toContain('material-theme-lighter')
    // Dual themes: dark colors are emitted as CSS variables on every token.
    expect(html).toContain('--shiki-dark:')
    expect(html).toContain('answer')
  })

  it('applies each theme\'s font style', async () => {
    const page = await createPage('/')
    const importStyle = () => page.locator('.shiki span', { hasText: /^import$/ }).evaluate((el) => {
      const { color, fontStyle } = getComputedStyle(el)
      return { color, fontStyle }
    })

    const light = await importStyle()
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    const dark = await importStyle()
    await page.close()

    expect(light.fontStyle).toBe('italic')
    expect(dark.fontStyle).toBe('italic')
    expect(dark.color).not.toBe(light.color)
  })
})
