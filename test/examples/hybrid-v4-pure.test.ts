import { describe, expect, it } from 'vitest'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'
import { example, trackServerContentRequests } from './utils'

describe('hybrid-v4-pure example', async () => {
  await setup({ ...example('hybrid-v4-pure'), browser: true })

  it('server-renders the first load', async () => {
    const html = await $fetch<string>('/about')
    expect(html).toContain('This page is rendered from the prerendered snapshot.')
    expect(html).toContain('href="/blog/hello"')
  })

  it('answers client-side navigation from the snapshot, not the server', async () => {
    const page = await createPage('/about')
    const serverRequests = trackServerContentRequests(page)

    await page.click('a[href="/blog/hello"]')
    await page.getByText('The first post of the hybrid example.').waitFor()
    expect(page.url()).toBe(url('/blog/hello'))

    await page.click('a[href="/"]')
    await page.getByText('Welcome to the hybrid example.').waitFor()
    expect(page.url()).toBe(url('/'))

    expect(serverRequests).toEqual([])
    await page.close()
  })
})
