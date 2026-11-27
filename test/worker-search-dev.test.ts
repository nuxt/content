import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { chromium, type Browser } from 'playwright-core'
import { setup, url } from '@nuxt/test-utils/e2e'

type Worker = { search: (q: string) => Promise<{ id: string }[]>, basePaths: { value: Record<string, string> } }

describe('search in a web worker, in dev', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/worker-search', import.meta.url)),
    dev: true,
  })

  let browser: Browser

  beforeAll(async () => {
    browser = await chromium.launch()
  })

  afterAll(async () => {
    await browser?.close()
  })

  it('loads an instance from its `basePath`', { timeout: 90_000 }, async () => {
    const page = await browser.newPage()
    await page.goto(url('/'))
    // Calls may fail until Vite has optimized the dependencies of a cold cache.
    const search = (query: string, basePaths: Record<string, string>) => page.evaluate(async ([query, basePaths]) => {
      const worker = (window as unknown as { __worker: Worker }).__worker
      worker.basePaths.value = basePaths
      return (await worker.search(query)).map(result => result.id).sort()
    }, [query, basePaths] as const).catch((error: Error) => error.message)

    await expect.poll(() => search('quokka', { docs: '/commits/b' }), { timeout: 60_000, interval: 500 }).toEqual(['/docs/en/quokka#quokka'])
    expect(await search('wombat', { docs: '/commits/b' })).toEqual([])
    await page.close()
  })
})
