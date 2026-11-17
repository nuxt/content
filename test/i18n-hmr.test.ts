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

    const collection = resolveCollection('team', defineCollection({
      type: 'data',
      source: 'data/*.yml',
      schema: z.object({ name: z.string(), role: z.string(), joined: z.date().optional() }),
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
      schema: z.object({ name: z.string(), role: z.string(), joined: z.date().optional() }),
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

    watchContents(nuxtMock, options, manifest)

    const updatedKeys = new Set<string>()
    const stopListening = contentHooks.hook('hmr:content:update', ({ key }) => {
      updatedKeys.add(key)
    })

    // With `ignoreInitial: true`, chokidar misses writes made before it finishes initializing
    await new Promise(resolve => setTimeout(resolve, 1000))

    const teamFile = join(contentDir, 'data', 'team.yml')
    await fs.writeFile(teamFile, withTranslations.replace('Jane Doe', 'Jane Smith'))

    await new Promise(resolve => setTimeout(resolve, 2000))

    expect(updatedKeys).toContain('team/data/team.yml')
    expect(updatedKeys).toContain('team/data/team.yml#fr')
    expect(updatedKeys).toContain('team/data/team.yml#de')

    // `database.server.ts` reads the hash of each dump entry from its ` -- <hash>` suffix
    expect(manifest.dump.team).toHaveLength(3)
    for (const entry of manifest.dump.team!) {
      expect(entry).toMatch(/; -- [\w-]+$/)
    }
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#fr\''))).toHaveLength(1)
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#de\''))).toHaveLength(1)

    await fs.writeFile(teamFile, withoutGerman)
    await new Promise(resolve => setTimeout(resolve, 2000))

    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#de\''))).toHaveLength(0)
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml#fr\''))).toHaveLength(1)
    for (const entry of manifest.dump.team!) {
      expect(entry).toMatch(/; -- [\w-]+$/)
    }

    const rows = await db.database?.prepare(`SELECT id FROM ${collection.tableName} ORDER BY id`).all() as Array<{ id: string }>
    expect(rows.map(row => row.id)).toEqual(['team/data/team.yml', 'team/data/team.yml#fr'])

    updatedKeys.clear()
    await fs.writeFile(join(contentDir, 'data', 'plain.yml'), 'name: Plain\nrole: Tester\n')
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect([...updatedKeys]).toEqual(['team/data/plain.yml'])

    const frenchFile = join(contentDir, 'data', 'french.yml')
    await fs.writeFile(frenchFile, ['name: Marie', 'role: Développeuse', 'locale: fr', 'i18n:', '  en:', '    role: Developer', ''].join('\n'))
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/french.yml#en\''))).toHaveLength(1)

    await fs.writeFile(frenchFile, ['name: Marie', 'role: Développeuse', 'locale: fr', ''].join('\n'))
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/french.yml#en\''))).toHaveLength(0)

    await fs.writeFile(join(contentDir, 'data', 'broken.yml'), 'name: Broken\nrole: Tester\ni18n: later\n')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // A translation that cannot be stored only drops its own row
    await fs.writeFile(join(contentDir, 'data', 'dated.yml'), ['name: Dated', 'role: Tester', 'joined: 2024-01-01', 'i18n:', '  fr:', '    joined: 1er janvier 2024', '  de:', '    role: Testerin', ''].join('\n'))
    await new Promise(resolve => setTimeout(resolve, 2000))

    await fs.rm(teamFile)
    await new Promise(resolve => setTimeout(resolve, 2000))

    stopListening()

    const ids = (await db.database?.prepare(`SELECT id FROM ${collection.tableName} ORDER BY id`).all() as Array<{ id: string }>).map(row => row.id)
    expect(ids).toContain('team/data/broken.yml')
    expect(ids).not.toContain('team/data/french.yml#en')
    expect(ids.filter(id => id.startsWith('team/data/dated.yml'))).toEqual(['team/data/dated.yml', 'team/data/dated.yml#de'])
    expect(ids.filter(id => id.startsWith('team/data/team.yml'))).toEqual([])
    expect(manifest.dump.team!.filter(entry => entry.includes('\'team/data/team.yml'))).toHaveLength(0)
  }, 40_000)
})
