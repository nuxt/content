import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { chromium, type Browser } from 'playwright-core'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
}

/** A static host: files from `dir`, `index.html` for directories, 404 for anything else. */
function serveStatic(dir: string) {
  return createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url!, 'http://localhost').pathname)
    for (const file of [join(dir, pathname), join(dir, pathname, 'index.html')]) {
      try {
        const body = await readFile(file)
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
        return res.end(body)
      }
      catch {
        // Not this candidate.
      }
    }
    res.writeHead(404).end()
  })
}

type SearchResult = { id: string, source: string, title: string, content: string }

describe('search in a web worker, on a static host', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/worker-search', import.meta.url)),
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

  it('publishes the snapshots the worker hydrates from', () => {
    expect(existsSync(join(publicDir, '__nuxt_content/snapshot/docs.json'))).toBe(true)
    expect(existsSync(join(publicDir, '__nuxt_content/snapshot/blog.json'))).toBe(true)
  })

  // sqlite-wasm references its own worker API and OPFS helper, which an in-memory database never loads.
  it('only emits the sqlite files the worker loads', () => {
    const files = readdirSync(join(publicDir, '_nuxt'))
    expect(files.filter(file => file.startsWith('sqlite3'))).toEqual([expect.stringMatching(/^sqlite3\..+\.wasm$/)])
  })

  it('doesn\'t preload the worker with the page', () => {
    const html = readFileSync(join(publicDir, 'index.html'), 'utf8')
    expect(html).toContain('/_nuxt/')
    expect(html).not.toContain('content-worker')
  })

  it('warms up after the page is ready and searches the prerendered content in the worker', { timeout: 60_000 }, async () => {
    const page = await browser.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    await page.getByText('The wombat runs the search in a web worker.').waitFor()
    // Nobody searched yet: `onNuxtReady()` started the hydration.
    await page.locator('#status', { hasText: 'ready' }).waitFor({ timeout: 30_000 })

    type Worker = { search: (q: string, o?: object) => Promise<SearchResult[]>, get: (key: string) => Promise<{ meta: { title: string } } | null>, instances: { value: string[] } }
    const search = (query: string, opts?: object) => page.evaluate(
      ([query, opts]) => (window as unknown as { __worker: Worker }).__worker.search(query as string, opts as object),
      [query, opts] as const,
    )
    const [worker] = page.workers()
    const snapshots = () => worker!.evaluate(() => performance.getEntriesByType('resource').map(entry => new URL(entry.name).pathname).filter(path => path.startsWith('/__nuxt_content/')))

    // Only the selected instance, as Docus selects the current locale's source.
    expect(await snapshots()).toEqual(['/__nuxt_content/snapshot/docs.json'])
    const docs = await search('wombat')
    expect(docs.map(result => result.id).sort()).toEqual(['/docs/en/install#configure-the-worker', '/docs/fr/install#configurer-le-worker'])
    expect(docs.find(result => result.id === '/docs/en/install#configure-the-worker')).toMatchObject({
      source: 'docs',
      title: 'Configure the worker',
      content: 'The wombat runs the search in a web worker.',
    })
    expect(await page.evaluate(() => (window as unknown as { __worker: Worker }).__worker.get('/docs/fr/install').then(doc => doc?.meta.title))).toBe('Installation')
    expect(await snapshots()).toEqual(['/__nuxt_content/snapshot/docs.json'])

    // Selecting more instances loads them, and one shared database ranks them in a single query.
    await page.evaluate(() => (window as unknown as { __worker: Worker }).__worker.instances.value = ['docs', 'blog'])
    await page.locator('#status', { hasText: 'ready' }).waitFor()
    expect(await snapshots()).toEqual(['/__nuxt_content/snapshot/docs.json', '/__nuxt_content/snapshot/blog.json'])
    const all = await search('wombat')
    expect(all.map(result => result.id).sort()).toEqual(['/blog/hello#hello', '/docs/en/install#configure-the-worker', '/docs/fr/install#configurer-le-worker'])

    // sqlite and the snapshots only ever load in the worker.
    const mainResources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name))
    expect(mainResources.filter(name => /\.wasm|__nuxt_content/.test(name))).toEqual([])
    expect(await page.evaluate(() => 'sqlite3ApiConfig' in globalThis)).toBe(false)
    const workerResources = await worker!.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name))
    expect(workerResources.some(path => path.endsWith('.wasm'))).toBe(true)

    // Nor in the scripts the page itself runs: only the worker's own script has it.
    const scripts = mainResources.filter(name => name.endsWith('.js') && name !== worker!.url())
    expect(scripts.length).toBeGreaterThan(0)
    const withSqlite = []
    for (const script of scripts) {
      if ((await fetch(script).then(response => response.text())).includes('sqlite3')) withSqlite.push(script)
    }
    expect(withSqlite).toEqual([])

    expect(errors).toEqual([])
    await page.close()
  })
})
