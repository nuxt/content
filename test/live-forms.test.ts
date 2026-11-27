import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { forge, json, liveFixtureDir, push, title, tmpDir, useLiveServers } from './fixtures/live-fixture'

/** Set the variables the fixture reads while it's built. */
function buildEnv(env: Record<string, string>) {
  beforeAll(() => {
    Object.assign(process.env, env)
  })
  afterAll(() => {
    for (const name of Object.keys(env)) Reflect.deleteProperty(process.env, name)
  })
}

describe('live content, with one source', async () => {
  buildEnv({ LIVE_FORM: 'source' })
  await setup({ rootDir: liveFixtureDir, server: false })
  const start = useLiveServers({ LIVE_FORM: 'source', LIVE_CACHE_DIR: '' })

  it('returns the result of its source from `revalidateContent()`', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/docs')).toBe('Docs at d1')
    expect(await push(server, 'acme/docs', 'c2')).toEqual({ from: 'd1', to: 'd1', changed: [], removed: [], navigation: false })
    expect(await push(server, 'acme/docs', 'd3')).toEqual({ from: 'd1', to: 'd3', changed: ['/docs', '/docs/new'], removed: ['/docs/old'], navigation: true })
  })

  it('calls the function on every request without `live.maxAge`', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/docs')).toBe('Docs at d1')
    await push(server, 'acme/docs', 'd3', false)
    expect(await title(server, '/docs')).toBe('Docs at d3')
  })
})

describe('live content, with one function for the sources of a repository', async () => {
  const LIVE_CACHE_DIR = tmpDir()
  buildEnv({ LIVE_FORM: 'shared', LIVE_CACHE_DIR })
  await setup({ rootDir: liveFixtureDir, server: false })
  const start = useLiveServers({ LIVE_FORM: 'shared' })

  it('leaves the commits to serve to the servers: the build stores none', { timeout: 20_000 }, async () => {
    const server = await start({ LIVE_CACHE_DIR, LIVE_DOCS_HEAD: 'd3' })
    expect(await title(server, '/docs')).toBe('Docs at d3')
  })

  it('pins every source to the commit of the function, and reports each of them', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/docs')).toBe('Docs at d1')
    await forge(server, 'reset')
    expect(await push(server, 'acme/docs', 'd3')).toEqual({
      docs_en: { from: 'd1', to: 'd3', changed: ['/docs', '/docs/new'], removed: ['/docs/old'], navigation: true },
      docs_fr: { from: 'd1', to: 'd3', changed: [], removed: [], navigation: false },
    })
    expect((await forge(server)).asked.filter(request => request.startsWith('head '))).toEqual(['head acme/docs'])
    expect(JSON.stringify(await json(server, '/__nuxt_content/get/fr'))).toContain('Docs en français')
  })
})

describe('live content, built while a `live.ref` function fails', async () => {
  buildEnv({ LIVE_DOWN: 'acme/site' })
  await setup({ rootDir: liveFixtureDir, server: false })
  const start = useLiveServers({ LIVE_DOWN: '' })

  it('ships no snapshot for that source, which a cold start reads from the forge', { timeout: 20_000 }, async () => {
    const server = await start()
    expect(await title(server, '/')).toBe('Home at s1')
    expect(await title(server, '/docs')).toBe('Docs at d1')
    expect((await forge(server)).asked.filter(request => /^(?:tree|file) /.test(request)).sort()).toEqual([
      'file acme/site@s1:content/about.md',
      'file acme/site@s1:content/index.md',
      'tree acme/site@s1',
    ])
  })
})
