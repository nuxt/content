import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { RuntimeConfig } from '@nuxt/content'

/**
 * Regression test for https://github.com/nuxt/content/issues/3829
 *
 * When `sqliteConnector: 'bun'` is configured and the build runs on Node.js,
 * the prerender stage fails because Node.js cannot resolve `bun:sqlite`.
 *
 * Root cause: `database.server.ts` had a static top-level import for
 * `#content/adapter`. Node.js ESM loader resolves ALL static imports at
 * module load time, even when the imported binding is never called at runtime.
 *
 * Fix: `#content/adapter` is now loaded via dynamic `import()` only in the
 * production code path, so the prerender stage never triggers `bun:sqlite`
 * resolution.
 */
describe('database.server - lazy adapter loading (issue #3829)', () => {
  const config: RuntimeConfig['content'] = {
    database: { type: 'sqlite', filename: ':memory:' },
    localDatabase: { type: 'sqlite', filename: ':memory:' },
    databaseVersion: 'test',
  } as RuntimeConfig['content']

  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  test('source does NOT contain a static top-level import of #content/adapter', async () => {
    const source = await readFile(
      resolve(__dirname, '../../src/runtime/internal/database.server.ts'),
      'utf-8',
    )

    // Should NOT have a static import statement for #content/adapter
    const staticImportPattern = /^import\s+\w+\s+from\s+['"]#content\/adapter['"]/m
    expect(source).not.toMatch(staticImportPattern)

    // Should still have the local-adapter static import (that one is fine,
    // it resolves to a Node.js-compatible connector)
    const localAdapterPattern = /^import\s+\w+\s+from\s+['"]#content\/local-adapter['"]/m
    expect(source).toMatch(localAdapterPattern)

    // Should have a dynamic import of #content/adapter
    const dynamicImportPattern = /import\(['"]#content\/adapter['"]\)/
    expect(source).toMatch(dynamicImportPattern)
  })

  test('loadDatabaseAdapter is async and returns a DatabaseAdapter', async () => {
    vi.doMock('#content/adapter', () => ({
      default: (_opts: unknown) => ({
        prepare: (_sql: string) => ({
          all: (..._params: unknown[]) => Promise.resolve([{ id: '1', title: 'Hello' }]),
          get: (..._params: unknown[]) => Promise.resolve({ id: '1', title: 'Hello' }),
          run: (..._params: unknown[]) => Promise.resolve(undefined),
        }),
      }),
    }))
    vi.doMock('#content/local-adapter', () => ({
      default: (_opts: unknown) => ({
        prepare: (_sql: string) => ({
          all: (..._params: unknown[]) => Promise.resolve([]),
          get: (..._params: unknown[]) => Promise.resolve(null),
          run: (..._params: unknown[]) => Promise.resolve(undefined),
        }),
      }),
    }))

    const mod = await import('../../src/runtime/internal/database.server')
    const loadDatabaseAdapter = mod.default

    const result = loadDatabaseAdapter(config)
    expect(result).toBeInstanceOf(Promise)

    const db = await result
    expect(db).toBeDefined()
    expect(db.all).toBeTypeOf('function')
    expect(db.first).toBeTypeOf('function')
    expect(db.exec).toBeTypeOf('function')
  })

  test('loadDatabaseAdapter production path uses dynamic adapter import', async () => {
    const adapterFn = vi.fn((_opts: unknown) => ({
      prepare: (_sql: string) => ({
        all: (..._params: unknown[]) => Promise.resolve([{ id: '1' }]),
        get: (..._params: unknown[]) => Promise.resolve({ id: '1' }),
        run: (..._params: unknown[]) => Promise.resolve(undefined),
      }),
    }))

    vi.doMock('#content/adapter', () => ({ default: adapterFn }))
    vi.doMock('#content/local-adapter', () => ({
      default: vi.fn(() => ({ prepare: vi.fn() })),
    }))

    const mod = await import('../../src/runtime/internal/database.server')
    const loadDatabaseAdapter = mod.default

    // In the test environment (non-dev, non-prerender), the production path is taken
    const db = await loadDatabaseAdapter(config)
    expect(adapterFn).toHaveBeenCalledOnce()

    // Subsequent calls should reuse the cached connection
    await loadDatabaseAdapter(config)
    expect(adapterFn).toHaveBeenCalledOnce() // still only once

    const result = await db.all('SELECT * FROM test')
    expect(result).toHaveLength(1)
  })

  test('concurrent first calls share a single adapter initialization', async () => {
    let releaseAdapter!: () => void
    const adapterGate = new Promise<void>((resolve) => {
      releaseAdapter = resolve
    })

    const adapterFn = vi.fn((_opts: unknown) => ({
      prepare: (_sql: string) => ({
        all: (..._params: unknown[]) => Promise.resolve([{ id: '1' }]),
        get: (..._params: unknown[]) => Promise.resolve({ id: '1' }),
        run: (..._params: unknown[]) => Promise.resolve(undefined),
      }),
    }))

    // Keep the dynamic import pending so both callers enter initialization
    // before either can finish creating the connector.
    vi.doMock('#content/adapter', async () => {
      await adapterGate
      return { default: adapterFn }
    })
    vi.doMock('#content/local-adapter', () => ({
      default: vi.fn(() => ({ prepare: vi.fn() })),
    }))

    const loadDatabaseAdapter = (await import('../../src/runtime/internal/database.server')).default

    const firstPromise = loadDatabaseAdapter(config)
    const secondPromise = loadDatabaseAdapter(config)

    // Allow both calls to reach the shared initialization await
    await Promise.resolve()
    expect(adapterFn).not.toHaveBeenCalled()

    releaseAdapter()

    const [first, second] = await Promise.all([firstPromise, secondPromise])

    expect(adapterFn).toHaveBeenCalledOnce()
    expect(first).toBeDefined()
    expect(second).toBeDefined()

    const [a, b] = await Promise.all([
      first.all('SELECT * FROM test'),
      second.all('SELECT * FROM test'),
    ])
    expect(a).toHaveLength(1)
    expect(b).toHaveLength(1)
  })
})
