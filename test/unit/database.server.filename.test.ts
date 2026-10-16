import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { RuntimeConfig } from '@nuxt/content'

/**
 * A relative SQLite `filename` is resolved against the server entry's file URL.
 * URL pathnames keep percent-encoding, so the path must be decoded before it is
 * handed to the connector. Otherwise a project under `/Users/me/My Projects`
 * writes its database to a new literal `/Users/me/My%20Projects` directory.
 */
describe.skipIf(process.platform === 'win32')('database.server - sqlite filename', () => {
  const serverDir = '/tmp/My Projects/Café #1/100% ready/server'

  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  async function resolvePath(filename: string) {
    const adapterFn = vi.fn((_opts: { path?: string }) => ({ prepare: vi.fn() }))
    vi.doMock('#content/adapter', () => ({ default: adapterFn }))
    vi.doMock('#content/local-adapter', () => ({ default: vi.fn(() => ({ prepare: vi.fn() })) }))
    vi.stubGlobal('_importMeta_', { url: pathToFileURL(`${serverDir}/index.mjs`).href })

    const config = {
      database: { type: 'sqlite', filename },
      localDatabase: { type: 'sqlite', filename: ':memory:' },
      databaseVersion: 'test',
    } as RuntimeConfig['content']

    const loadDatabaseAdapter = (await import('../../src/runtime/internal/database.server')).default
    await loadDatabaseAdapter(config)

    expect(adapterFn).toHaveBeenCalledOnce()
    return adapterFn.mock.calls[0]![0].path
  }

  test('decodes spaces, Unicode, # and % in parent directories', async () => {
    expect(await resolvePath('./contents.sqlite')).toBe(`${serverDir}/contents.sqlite`)
  })

  test('decodes percent-encoded characters in the filename', async () => {
    expect(await resolvePath('./literal%2520name.sqlite')).toBe(`${serverDir}/literal%20name.sqlite`)
  })

  test.each([
    './100% ready.sqlite',
    './contents.sqlite%',
    './contents%2.sqlite',
    './contents%GG.sqlite',
  ])('preserves literal percent signs in %s', async (filename) => {
    expect(await resolvePath(filename)).toBe(`${serverDir}/${filename.slice(2)}`)
  })

  test('decodes encoded characters alongside literal percent signs once', async () => {
    expect(await resolvePath('./100% Caf%c3%a9%20%2520.sqlite')).toBe(`${serverDir}/100% Café %20.sqlite`)
  })

  test.each([
    'literal%FF.sqlite',
    'literal%C3.sqlite',
    'literal%80.sqlite',
    'literal%C0%AF.sqlite',
    'literal%ED%A0%80.sqlite',
    'literal%F4%90%80%80.sqlite',
  ])('preserves invalid UTF-8 escapes in %s', async (filename) => {
    expect(await resolvePath(`./${filename}`)).toBe(`${serverDir}/${filename}`)
  })

  test('decodes valid escapes around invalid UTF-8 without decoding twice', async () => {
    expect(await resolvePath('./%FF%20Caf%C3%A9%80%2520%E2%82%AC%F0%9F%98%80.sqlite')).toBe(`${serverDir}/%FF Café%80%20€😀.sqlite`)
  })

  test('keeps absolute filenames unchanged', async () => {
    expect(await resolvePath('/tmp/absolute path/contents.sqlite')).toBe('/tmp/absolute path/contents.sqlite')
  })
})
