import { existsSync } from 'node:fs'
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
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

  test('returns undefined when required connection values are missing', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'postgres-js' })).toBeUndefined()
    expect(hubDatabaseToContentDatabase({ driver: 'postgres-js', connection: { url: '' } })).toBeUndefined()
    expect(hubDatabaseToContentDatabase({ driver: 'sqlite' })).toBeUndefined()
    expect(hubDatabaseToContentDatabase({ driver: 'sqlite', connection: {} })).toBeUndefined()
  })

  test('returns undefined for non-string connection values', () => {
    expect(hubDatabaseToContentDatabase({ driver: 'postgres-js', connection: { url: 123 as unknown as string } })).toBeUndefined()
    expect(hubDatabaseToContentDatabase({ driver: 'sqlite', connection: { filename: true, url: 123 as unknown as string } })).toBeUndefined()
    expect(hubDatabaseToContentDatabase({ driver: 'sqlite', connection: { filename: true, url: 'file:.data/hub/db/sqlite.db' } }))
      .toEqual({ type: 'sqlite', filename: '.data/hub/db/sqlite.db' })
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

  test('maps the string form of hub.db to the same database', async () => {
    const nuxt = createNuxt(
      { db: 'sqlite' },
      { db: { driver: 'libsql', connection: { url: 'file:.data/hub/db/sqlite.db' }, applyMigrationsDuringBuild: false } },
    )
    const nitroConfig = { runtimeConfig: { content: {} }, rootDir: '/' } as unknown as NitroConfig
    await nuxthubPreset.setupNitro(nitroConfig, { ...opts, moduleOptions: {} as ModuleOptions, nuxt })

    expect(nitroConfig.runtimeConfig!.content!.database).toEqual({ type: 'libsql', url: 'file:/tmp/sqlite.db' })
    expect(nitroConfig.runtimeConfig!.content!.integrityCheck).toBe(true)
  })
})

describe('nuxthub preset setupNitro dump handoff', () => {
  const dumpManifest = { collections: [], dump: { posts: ['INSERT INTO posts VALUES (1);'] } } as unknown as Manifest

  async function runSetupNitro(runtimeDb: Record<string, unknown>) {
    const nuxt = createNuxt(
      { db: { dialect: 'sqlite' } },
      { db: runtimeDb, dir: '.data/hub' },
    )
    const rootDir = await mkdtemp(join(tmpdir(), 'nuxthub-preset-'))
    const nitroConfig = { runtimeConfig: { content: {} }, rootDir } as unknown as NitroConfig
    await nuxthubPreset.setupNitro(nitroConfig, { ...opts, manifest: dumpManifest, moduleOptions: {} as ModuleOptions, nuxt })
    return { nitroConfig, queriesDir: join(rootDir, '.data/hub/db/queries') }
  }

  test('skips the handoff for a local file database and keeps the integrity check', async () => {
    const { nitroConfig, queriesDir } = await runSetupNitro({ driver: 'libsql', connection: { url: 'file:.data/hub/db/sqlite.db' }, applyMigrationsDuringBuild: true })

    expect(existsSync(queriesDir)).toBe(false)
    expect(nitroConfig.runtimeConfig!.content!.database).toEqual({ type: 'libsql', url: 'file:/tmp/sqlite.db' })
    expect(nitroConfig.runtimeConfig!.content!.integrityCheck).toBe(true)
  })

  test('keeps the integrity check when the local database is already in /tmp', async () => {
    const { nitroConfig, queriesDir } = await runSetupNitro({ driver: 'libsql', connection: { url: 'file:/tmp/sqlite.db' }, applyMigrationsDuringBuild: true })

    expect(existsSync(queriesDir)).toBe(false)
    expect(nitroConfig.runtimeConfig!.content!.database).toEqual({ type: 'libsql', url: 'file:/tmp/sqlite.db' })
    expect(nitroConfig.runtimeConfig!.content!.integrityCheck).toBe(true)
  })

  test('hands off the dump for a remote database and disables the integrity check', async () => {
    const { nitroConfig, queriesDir } = await runSetupNitro({ driver: 'libsql', connection: { url: 'libsql://content.turso.io' }, applyMigrationsDuringBuild: true })

    expect(await readdir(queriesDir)).toEqual(['content-database-001.sql'])
    expect(await readFile(join(queriesDir, 'content-database-001.sql'), 'utf8')).toContain('INSERT INTO posts VALUES (1);')
    expect(nitroConfig.runtimeConfig!.content!.database).toEqual({ type: 'libsql', url: 'libsql://content.turso.io' })
    expect(nitroConfig.runtimeConfig!.content!.integrityCheck).toBe(false)
  })
})
