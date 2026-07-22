import fs from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { defineCollection, z } from '../src/utils'
import { generateCollectionTableDefinition, resolveCollection } from '../src/utils/collection'
import { contentHooks, watchContents } from '../src/utils/dev'
import { getLocalDatabase } from '../src/utils/database'
import { initiateValidatorsContext } from '../src/utils/dependencies'
import type { LocalDevelopmentDatabase } from '../src/module'
import type { Manifest } from '../src/types/manifest'

const rootDir = join(tmpdir(), 'nuxt-content-i18n-hmr-test-' + Date.now())
const contentDir = join(rootDir, 'content')
const dbPath = join(rootDir, 'contents.sqlite')

// Capture close callbacks so afterAll can stop the watcher before deleting
// rootDir, otherwise unlink events fire against the removed database
const closeCallbacks: Array<() => Promise<void> | void> = []
const nuxtMock = {
  options: { rootDir, buildDir: join(rootDir, '.nuxt') },
  callHook: () => Promise.resolve(),
  hook: (_event: string, cb: () => void) => {
    closeCallbacks.push(cb)
  },
} as never

const withTranslations = [
  'name: Jane Doe',
  'role: Developer',
  'i18n:',
  '  fr:',
  '    role: Développeuse',
  '  de:',
  '    role: Entwicklerin',
  '',
].join('\n')

const withoutGerman = [
  'name: Jane Doe',
  'role: Developer',
  'i18n:',
  '  fr:',
  '    role: Développeuse',
  '',
].join('\n')

describe('i18n HMR — inline translations expand to hash-suffixed dump rows', () => {
  let db: LocalDevelopmentDatabase

  beforeAll(async () => {
    await initiateValidatorsContext()

    await fs.mkdir(join(contentDir, 'data'), { recursive: true })
    await fs.writeFile(join(contentDir, 'data', 'team.yml'), withTranslations)

    db = await getLocalDatabase({ type: 'sqlite', filename: dbPath })

    // Pre-create the collection table so broadcast's DELETE/INSERT can run
    const collection = resolveCollection('team', defineCollection({
      type: 'data',
      source: 'data/*.yml',
      schema: z.object({ name: z.string(), role: z.string() }),
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
    }))!
    for (const stmt of generateCollectionTableDefinition(collection, { drop: true }).split('\n')) {
      await db.exec(stmt)
    }
  })

  afterAll(async () => {
    for (const close of closeCallbacks) {
      await close()
    }
    db?.close()
    await fs.rm(rootDir, { recursive: true, force: true })
  })

  test('updating a file splices one hash-suffixed dump entry per locale and cleans removed locales', async () => {
    const collection = resolveCollection('team', defineCollection({
      type: 'data',
      source: 'data/*.yml',
      schema: z.object({ name: z.string(), role: z.string() }),
      i18n: { locales: ['en', 'fr', 'de'], defaultLocale: 'en' },
    }))!

    // Populate source.cwd (normally done by module setup)
    for (const source of collection.source!) {
      await source.prepare?.({ rootDir })
    }

    const manifest: Manifest = {
      collections: [collection],
      dump: { team: [] },
      checksum: {},
      checksumStructure: {},
      components: [],
    }

    const options = {
      _localDatabase: { type: 'sqlite' as const, filename: dbPath },
      experimental: {},
    } as never

    // Start watching — this is the function under test
    watchContents(nuxtMock, options, manifest)

    const updatedKeys = new Set<string>()
    const stopListening = contentHooks.hook('hmr:content:update', ({ key }) => {
      updatedKeys.add(key)
    })

    // Let chokidar finish arming before writing, writes during initialization
    // are silently missed with `ignoreInitial: true`
    await new Promise(resolve => setTimeout(resolve, 1000))

    const teamFile = join(contentDir, 'data', 'team.yml')
    await fs.writeFile(teamFile, withTranslations.replace('Jane Doe', 'Jane Smith'))

    // Give the watcher time to detect, parse and broadcast (chokidar + async)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // One broadcast per expanded locale row: the default locale keeps the bare
    // key, translations get a `#<locale>` suffix
    expect(updatedKeys).toContain('team/data/team.yml')
    expect(updatedKeys).toContain('team/data/team.yml#fr')
    expect(updatedKeys).toContain('team/data/team.yml#de')

    // Every spliced dump entry must keep the ` -- <hash>` suffix so the runtime
    // hash comparison in database.server.ts keeps working after HMR updates
    expect(manifest.dump.team).toHaveLength(3)
    for (const entry of manifest.dump.team!) {
      expect(entry).toMatch(/; -- [\w-]+$/)
    }
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#fr\''))).toHaveLength(1)
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#de\''))).toHaveLength(1)

    // Dropping a locale from the `i18n` section removes its dump entry and row
    await fs.writeFile(teamFile, withoutGerman)
    await new Promise(resolve => setTimeout(resolve, 2000))

    stopListening()

    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#de\''))).toHaveLength(0)
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#fr\''))).toHaveLength(1)
    for (const entry of manifest.dump.team!) {
      expect(entry).toMatch(/; -- [\w-]+$/)
    }

    const rows = await db.database?.prepare(`SELECT id FROM ${collection.tableName} ORDER BY id`).all() as Array<{ id: string }>
    expect(rows.map(row => row.id)).toEqual(['team/data/team.yml', 'team/data/team.yml#fr'])
  }, 15_000)
})
