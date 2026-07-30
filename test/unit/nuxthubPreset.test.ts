import { describe, expect, test, vi } from 'vitest'
import type { Nuxt } from '@nuxt/schema'
import type { Resolver } from '@nuxt/kit'
import type { NitroConfig } from 'nitropack'
import nuxthubPreset, { hubDatabaseToContentDatabase } from '../../src/presets/nuxthub'
import type { ModuleOptions } from '../../src/types/module'
import type { Manifest } from '../../src/types/manifest'

// `addTemplate` and `addServerHandler` require a live Nuxt context
vi.mock('@nuxt/kit', async (importOriginal) => {
  const original = await importOriginal<typeof import('@nuxt/kit')>()
  return {
    ...original,
    addTemplate: vi.fn(() => ({ dst: '' })),
    addServerHandler: vi.fn(),
  }
})

const resolver = { resolve: (p: string) => p } as unknown as Resolver
const manifest = { collections: [], dump: {} } as unknown as Manifest
const opts = { resolver, manifest }

function createNuxt(hub: Record<string, unknown>, runtimeHub: Record<string, unknown>): Nuxt {
  return {
    options: {
      dev: false,
      hub,
      nitro: { preset: 'node-server' },
      runtimeConfig: { hub: runtimeHub },
    },
  } as unknown as Nuxt
}

describe('hubDatabaseToContentDatabase', () => {
  test('maps d1 driver to d1 database', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'd1' })).toEqual({ type: 'd1', bindingName: 'DB' })
  })

  test('maps postgres drivers to postgresql database', () => {
    for (const driver of ['node-postgres', 'postgres-js', 'neon-http', 'postgres', 'postgresql']) {
      expect(hubDatabaseToContentDatabase({ driver, connection: { url: 'postgres://localhost' } }))
        .toEqual({ type: 'postgresql', url: 'postgres://localhost' })
    }
  })

  test('maps sqlite drivers to sqlite database', () => {
    for (const driver of ['sqlite', 'better-sqlite3']) {
      expect(hubDatabaseToContentDatabase({ driver, connection: { url: 'file:.data/hub/db/sqlite.db' } }))
        .toEqual({ type: 'sqlite', filename: '.data/hub/db/sqlite.db' })
    }
  })

  test('keeps an explicit sqlite filename', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'sqlite', connection: { filename: './contents.sqlite' } }))
      .toEqual({ type: 'sqlite', filename: './contents.sqlite' })
  })

  test('maps libsql driver with its connection', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'libsql', connection: { url: 'file:.data/hub/db/sqlite.db' } }))
      .toEqual({ type: 'libsql', url: 'file:.data/hub/db/sqlite.db' })
  })

  test('maps pglite driver with its connection', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'pglite', connection: { dataDir: '.data/hub/db/pglite' } }))
      .toEqual({ type: 'pglite', dataDir: '.data/hub/db/pglite' })
  })

  test('returns undefined for unsupported drivers', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'mysql2', connection: { uri: 'mysql://localhost' } })).toBeUndefined()
  })
})

describe('nuxthub preset setup', () => {
  const resolvedSqliteDb = { driver: 'libsql', connection: { url: 'file:.data/hub/db/sqlite.db' } }

  test('maps the string form of hub.db', async () => {
    const options = {} as ModuleOptions
    await nuxthubPreset.setup!(options, createNuxt({ db: 'sqlite' }, { db: resolvedSqliteDb }), opts)

    expect(options.database).toEqual({ type: 'libsql', url: 'file:.data/hub/db/sqlite.db' })
  })

  test('maps the object form of hub.db', async () => {
    const options = {} as ModuleOptions
    await nuxthubPreset.setup!(options, createNuxt({ db: { dialect: 'sqlite', applyMigrationsDuringBuild: false } }, { db: resolvedSqliteDb }), opts)

    expect(options.database).toEqual({ type: 'libsql', url: 'file:.data/hub/db/sqlite.db' })
  })

  test('does not override an explicitly configured database', async () => {
    const options = { database: { type: 'libsql', url: 'file:/tmp/sqlite.db' } } as ModuleOptions
    await nuxthubPreset.setup!(options, createNuxt({ db: { dialect: 'sqlite' } }, { db: resolvedSqliteDb }), opts)

    expect(options.database).toEqual({ type: 'libsql', url: 'file:/tmp/sqlite.db' })
  })

  test('leaves the database unset for unsupported drivers', async () => {
    const options = {} as ModuleOptions
    await nuxthubPreset.setup!(options, createNuxt({ db: { dialect: 'mysql' } }, { db: { driver: 'mysql2', connection: { uri: 'mysql://localhost' } } }), opts)

    expect(options.database).toBeUndefined()
  })

  test('uses d1 with NuxtHub <= 0.9', async () => {
    const options = {} as ModuleOptions
    await nuxthubPreset.setup!(options, createNuxt({ database: true }, { database: true }), opts)

    expect(options.database).toEqual({ type: 'd1', bindingName: 'DB' })
  })
})

describe('nuxthub preset setupNitro', () => {
  test('maps the object form of hub.db and rewrites local libsql to /tmp', async () => {
    const nuxt = createNuxt(
      { db: { dialect: 'sqlite', applyMigrationsDuringBuild: false } },
      { db: { driver: 'libsql', connection: { url: 'file:.data/hub/db/sqlite.db' }, applyMigrationsDuringBuild: false } },
    )
    const nitroConfig = { runtimeConfig: { content: {} }, rootDir: '/' } as unknown as NitroConfig
    await nuxthubPreset.setupNitro(nitroConfig, { ...opts, moduleOptions: {} as ModuleOptions, nuxt })

    expect(nitroConfig.runtimeConfig!.content!.database).toEqual({ type: 'libsql', url: 'file:/tmp/sqlite.db' })
    expect(nitroConfig.runtimeConfig!.content!.integrityCheck).toBe(true)
  })
})
