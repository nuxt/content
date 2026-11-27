import { existsSync } from 'node:fs'
import type { Server } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { chromium, type Browser } from 'playwright-core'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'
import { serveStatic } from './fixtures/static-server'

describe('app/content.ts in server-only mode, on a static host', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/app-content', import.meta.url)),
    nuxtConfig: {
      content: { mode: 'server-only' },
      nitro: { preset: 'static' },
    },
    // Served below from `.output/public`, without Nitro.
    server: false,
  })

  let publicDir: string
  let server: Server
  let url: string
  let browser: Browser

  beforeAll(async () => {
    publicDir = join(useTestContext().nuxt!.options.nitro.output!.dir!, 'public')
    server = serveStatic(publicDir)
    await new Promise<void>(resolve => server.listen(0, resolve))
    url = `http://localhost:${(server.address() as { port: number }).port}`
    browser = await chromium.launch()
  })

  afterAll(async () => {
    await browser?.close()
    server?.close()
  })

  it('publishes the manifest and the snapshots', () => {
    expect(existsSync(join(publicDir, '__nuxt_content/manifest.json'))).toBe(true)
    expect(existsSync(join(publicDir, '__nuxt_content/snapshot/docs.json'))).toBe(true)
    expect(existsSync(join(publicDir, '__nuxt_content/snapshot/blog.json'))).toBe(true)
  })

  it('reads in the browser from the snapshot, with the plugins of `app/content.ts`', { timeout: 30_000 }, async () => {
    const page = await browser.newPage()
    const requests: string[] = []
    page.on('request', request => requests.push(new URL(request.url()).pathname))
    await page.goto(url)
    expect(JSON.parse(await page.locator('#probes').textContent() ?? '')).toEqual({ docs: ['project'], blog: ['project'] })

    const title = await page.evaluate(() => (window as unknown as { __content: { get: (path: string) => Promise<{ meta: { title: string } } | null> } }).__content.get('/blog/hello').then(doc => doc?.meta.title))
    expect(title).toBe('Hello')
    // Only artifacts: the `/__nuxt_content` API doesn't exist on a static host. A hub `get` by path loads every instance.
    expect(requests.filter(path => path.startsWith('/__nuxt_content/')).sort()).toEqual(['/__nuxt_content/snapshot/blog.json', '/__nuxt_content/snapshot/docs.json'])
    await page.close()
  })
})
