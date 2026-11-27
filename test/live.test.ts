import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'
import { forge, json, liveFixtureDir, push, title, tmpDir, useLiveServers } from './fixtures/live-fixture'

describe('live content, with a source per repository', async () => {
  await setup({
    rootDir: liveFixtureDir,
    server: false,
  })
  const start = useLiveServers()

  it('serves each source at the commit its `live.ref` function returns', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/')).toBe('Home at s1')
    expect(await title(server, '/docs')).toBe('Docs at d1')
  })

  it('moves a pushed source to its new commit, and reports what changed in it', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/docs')).toBe('Docs at d1')
    await forge(server, 'reset')
    // `d3` changes the docs home, adds a page and deletes one.
    expect(await push(server, 'acme/docs', 'd3')).toEqual({
      docs: { from: 'd1', to: 'd3', changed: ['/docs', '/docs/new'], removed: ['/docs/old'], navigation: true },
    })
    expect(await title(server, '/docs')).toBe('Docs at d3')
    expect(await title(server, '/')).toBe('Home at s1')
    expect((await forge(server)).asked.filter(request => request.includes('acme/site'))).toEqual(['head acme/site'])

    // `d4` changes one paragraph of the guide.
    expect(await push(server, 'acme/docs', 'd4')).toEqual({
      docs: { from: 'd3', to: 'd4', changed: ['/docs/guide'], removed: [], navigation: false },
    })
  })

  it('leaves a source at its commit when a push changes none of its files', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/docs')).toBe('Docs at d1')
    await forge(server, 'reset')
    // `c2` only changes the README.
    expect(await push(server, 'acme/docs', 'c2')).toEqual({})
    expect((await forge(server)).asked.sort()).toEqual(['commits acme/docs:docs', 'head acme/site'])
  })

  it('fails `lastCommit()` when no commit touches its path', { timeout: 20_000 }, async () => {
    const server = await start({ LIVE_LAST_COMMIT_PATH: 'nowhere' })
    await expect(push(server, 'acme/docs', 'd3')).rejects.toThrow(/`docs` failed: lastCommit: no commit touches `nowhere` on `main` of `acme\/docs`/)
  })

  it('reports every document as changed for a source with no stored commit', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await push(server, 'acme/site', 's2')).toEqual({
      site: { from: null, to: 's2', changed: ['/', '/about'], removed: [], navigation: true },
      docs: { from: null, to: 'd1', changed: ['/docs', '/docs/guide', '/docs/old'], removed: [], navigation: true },
    })
  })

  it('moves the sources whose function answered when another fails in `revalidateContent()`, which then throws', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/')).toBe('Home at s1')
    await push(server, 'acme/site', 's2', false)
    await forge(server, 'down=acme/site')
    await expect(push(server, 'acme/docs', 'd3')).rejects.toThrow(/500 .*`site`/)
    expect(await title(server, '/docs')).toBe('Docs at d3')
    expect(await title(server, '/')).toBe('Home at s1')
  })

  it('serves the stored commits for `live.maxAge`, then asks the functions again', { timeout: 20_000 }, async () => {
    const server = await start({ LIVE_MAX_AGE: '1' })
    expect(await title(server, '/docs')).toBe('Docs at d1')
    // Push without a webhook.
    await push(server, 'acme/docs', 'd3', false)
    await forge(server, 'reset')
    expect(await title(server, '/docs')).toBe('Docs at d1')
    expect((await forge(server)).asked).toEqual([])

    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(await title(server, '/docs')).toBe('Docs at d3')
  })

  it('keeps a source at its stored commit when its function fails on a request, while the others move', { timeout: 20_000 }, async () => {
    const server = await start({ LIVE_MAX_AGE: '1' })
    await push(server, 'acme/site', 's2')
    await push(server, 'acme/site', 's3', false)
    await push(server, 'acme/docs', 'd3', false)
    await forge(server, 'down=acme/site')

    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(await title(server, '/docs')).toBe('Docs at d3')
    expect(await title(server, '/')).toBe('Home at s2')

    await forge(server, 'down=')
    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(await title(server, '/')).toBe('Home at s3')
  })

  it('serves a cold start from the build snapshot, at its commit, when the forge is down', { timeout: 20_000 }, async () => {
    const server = await start({ LIVE_FORGE: 'offline' })
    expect(await title(server, '/')).toBe('Home at s1')
    expect(await title(server, '/docs')).toBe('Docs at d1')
    expect(JSON.stringify(await json(server, '/__nuxt_content/get/docs/guide'))).toContain('Read it first.')
    expect((await forge(server)).asked.filter(request => /^(?:tree|file) /.test(request))).toEqual([])
  })

  it('serves on every server the commits one of them stored in the shared cache driver', { timeout: 20_000 }, async () => {
    const LIVE_CACHE_DIR = tmpDir()
    const first = await start({ LIVE_CACHE_DIR })
    const second = await start({ LIVE_CACHE_DIR })
    expect(await title(first, '/docs')).toBe('Docs at d1')
    expect(await title(second, '/docs')).toBe('Docs at d1')
    expect((await forge(second)).asked).toEqual([])

    await push(first, 'acme/docs', 'd3')
    expect(await title(second, '/docs')).toBe('Docs at d3')
    expect((await forge(second)).asked.filter(request => /^(?:head|commits) /.test(request))).toEqual([])
  })

  it('reads only the files that changed since the build on a cold start at a newer commit', { timeout: 20_000 }, async () => {
    const server = await start()
    await push(server, 'acme/docs', 'd3', false)
    expect(await title(server, '/docs')).toBe('Docs at d3')
    expect(JSON.stringify(await json(server, '/__nuxt_content/get/docs/guide'))).toContain('Read it first.')
    expect((await forge(server)).asked.filter(request => request.startsWith('file acme/docs')).sort()).toEqual([
      'file acme/docs@d3:docs/index.md',
      'file acme/docs@d3:docs/new.md',
    ])
  })

  it('calls the functions once for the requests that arrive while they run', { timeout: 20_000 }, async () => {
    const server = await start()
    await forge(server, 'slow=300')
    expect(await Promise.all([title(server, '/'), title(server, '/docs'), title(server, '/')])).toEqual(['Home at s1', 'Docs at d1', 'Home at s1'])
    expect((await forge(server)).asked.filter(request => request.startsWith('head '))).toEqual(['head acme/site'])
  })

  it('keeps the content of the current and the previous commit of a source, and releases older ones', { timeout: 20_000 }, async () => {
    const server = await start()
    const served = () => json<Record<string, { ref: string, status: string }[]>>(server, '/api/served')
    await served()
    for (const head of ['d3', 'd4']) {
      await push(server, 'acme/docs', head)
      await served()
    }
    const kept = (ref: string) => expect.objectContaining({ ref, status: expect.not.stringMatching('disposed') })
    await expect.poll(served).toEqual({
      docs: [{ ref: 'd1', status: 'disposed' }, kept('d3'), kept('d4')],
      site: [kept('s1')],
    })
  })

  it('doesn\'t go back to the commit a call that started before a push returns after it', { timeout: 20_000 }, async () => {
    const server = await start()
    // Starts before the push and gets `s1` 400ms later.
    await forge(server, 'slow=400')
    const inFlight = title(server, '/')
    await new Promise(resolve => setTimeout(resolve, 100))
    await forge(server, 'slow=0')
    await push(server, 'acme/site', 's2')
    expect(await title(server, '/')).toBe('Home at s2')
    await inFlight
    expect(await title(server, '/')).toBe('Home at s2')
  })

  it('renders a page pushed after the build with the components it uses', { timeout: 20_000 }, async () => {
    const server = await start()
    await push(server, 'acme/docs', 'd3')
    const html = await fetch(`${server.url}/docs/new`).then(response => response.text())
    expect(html).toMatch(/<div class="live-alert"[^>]*>.*Only since d3\./s)
  })

  it('generates the types from the declared schemas, without asking the forge', () => {
    const types = readFileSync(join(useTestContext().nuxt!.options.buildDir, 'content/types.d.ts'), 'utf8')
    expect(types).toMatch(/interface DocsData \{[^}]*badge\?: string/)
    const copies = (globalThis as { __liveModuleForge?: { asked: string[] }[] }).__liveModuleForge!
    expect(copies.length).toBeGreaterThan(0)
    expect(copies.flatMap(copy => copy.asked)).toEqual([])
  })

  it('publishes no static snapshot', () => {
    const outputDir = useTestContext().nuxt!.options.nitro.output!.dir!
    expect(existsSync(join(outputDir, 'static'))).toBe(true)
    expect(existsSync(join(outputDir, 'static/__nuxt_content'))).toBe(false)
  })
})
