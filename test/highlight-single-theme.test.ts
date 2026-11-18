import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('v3 `content.build.markdown.highlight` with a single theme', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/highlight', import.meta.url)),
    nuxtConfig: {
      content: { build: { markdown: { highlight: { theme: 'material-theme-lighter' } } } },
    },
    browser: true,
  })

  it('applies the theme\'s font style in both color modes', async () => {
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
    // There is no dark theme, so `html.dark` must keep the light colors.
    expect(dark).toEqual(light)
  })
})
