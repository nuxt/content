import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Resolver } from '@nuxt/kit'
import { resolveDatabaseAdapter } from '../../src/utils/database'
import { isNodeSqliteAvailable } from '../../src/utils/dependencies'

// A minimal resolver that echoes the path it is asked to resolve so we can
// assert which runtime connector module was selected.
const resolver = { resolve: (p: string) => p } as unknown as Resolver

describe('resolveDatabaseAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('resolves the bun connector when sqliteConnector is "bun"', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const adapter = await resolveDatabaseAdapter('sqlite', { resolver, sqliteConnector: 'bun' })
    expect(adapter).toBe('./runtime/internal/connectors/bun-sqlite')
  })

  test('warns about the build-time fallback when targeting bun outside of a Bun runtime', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await resolveDatabaseAdapter('sqlite', { resolver, sqliteConnector: 'bun' })

    if (process.versions.bun) {
      // Running inside Bun: no fallback needed, so no warning.
      expect(warn).not.toHaveBeenCalled()
    }
    else {
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]![0]).toContain('Bun runtime')
    }
  })

  test('resolves the sqlite3 connector', async () => {
    const adapter = await resolveDatabaseAdapter('sqlite', { resolver, sqliteConnector: 'sqlite3' })
    expect(adapter).toBe('db0/connectors/sqlite3')
  })

  test('resolves the native connector when node:sqlite is available', async () => {
    if (!isNodeSqliteAvailable()) {
      return
    }
    const adapter = await resolveDatabaseAdapter('sqlite', { resolver, sqliteConnector: 'native' })
    expect(adapter).toBe('./runtime/internal/connectors/node-sqlite')
  })

  test('resolves non-sqlite adapters directly without touching the sqlite connector logic', async () => {
    expect(await resolveDatabaseAdapter('postgresql', { resolver })).toBe('db0/connectors/postgresql')
    expect(await resolveDatabaseAdapter('postgres', { resolver })).toBe('db0/connectors/postgresql')
    expect(await resolveDatabaseAdapter('d1', { resolver })).toBe('db0/connectors/cloudflare-d1')
    expect(await resolveDatabaseAdapter('libsql', { resolver })).toBe('db0/connectors/libsql/node')
    expect(await resolveDatabaseAdapter('pglite', { resolver })).toBe('db0/connectors/pglite')
  })
})
