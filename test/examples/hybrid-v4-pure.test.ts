import { describe, expect, it } from 'vitest'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'
import { example, trackServerContentRequests } from './utils'

describe('hybrid-v4-pure example', async () => {
  const config = example('hybrid-v4-pure')
  await setup({
    ...config,
    nuxtConfig: {
      ...config.nuxtConfig,
      // Installed from npm, the runtime lives in `node_modules`, which Nuxt doesn't auto-import into.
      // Match that here, or a bare global like `$fetch` would be rewritten into an import.
      imports: { transform: { exclude: [/[\\/]src[\\/]runtime[\\/]/] } },
    },
    browser: true,
  })

  it('server-renders the first load', async () => {
    const html = await $fetch<string>('/about')
    expect(html).toContain('This page is rendered from the prerendered snapshot.')
    expect(html).toContain('href="/blog/hello"')
  })

  it('answers client-side navigation from the snapshot, not the server', async () => {
    const page = await createPage('/about')
    const serverRequests = trackServerContentRequests(page)
    // A full page load would reset this, so it proves the router handled the clicks.
    await page.evaluate(() => Object.assign(window, { __clientNavigation: true }))

    await page.click('a[href="/blog/hello"]')
    await page.getByText('The first post of the hybrid example.').waitFor()
    expect(page.url()).toBe(url('/blog/hello'))

    await page.click('a[href="/"]')
    await page.getByText('Welcome to the hybrid example.').waitFor()
    expect(page.url()).toBe(url('/'))

    expect(await page.evaluate(() => (window as { __clientNavigation?: boolean }).__clientNavigation)).toBe(true)
    expect(serverRequests).toEqual([])
    await page.close()
  })
})
