import fs from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { defineCollection } from '../src/utils'
import { generateCollectionTableDefinition, resolveCollection } from '../src/utils/collection'
import { contentHooks, watchContents } from '../src/utils/dev'
import { getLocalDatabase } from '../src/utils/database'
import { initiateValidatorsContext } from '../src/utils/dependencies'
import type { LocalDevelopmentDatabase } from '../src/module'
import type { Manifest } from '../src/types/manifest'
import type { FSWatcher } from 'chokidar'

const templates = vi.hoisted(() => ({ finish: () => {}, calls: 0 }))
const watchers = vi.hoisted(() => [] as FSWatcher[])

// Keep the content watcher so the test can wait for it to be ready instead of sleeping.
vi.mock('chokidar', async (importOriginal) => {
  const chokidar = await importOriginal<typeof import('chokidar')>()
  const watch: typeof chokidar.watch = (...args) => {
    const watcher = chokidar.watch(...args)
    watchers.push(watcher)
    return watcher
  }
  return { ...chokidar, watch, default: { ...chokidar.default, watch } }
})

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  updateTemplates: () => {
    templates.calls++
    return new Promise<void>((resolve) => {
      templates.finish = resolve
    })
  },
}))

const rootDir = join(tmpdir(), 'nuxt-content-hmr-order-test-' + Date.now())
const contentDir = join(rootDir, 'content')
const dbPath = join(rootDir, 'contents.sqlite')

const nuxtMock = {
  options: { rootDir, buildDir: join(rootDir, '.nuxt') },
  callHook: () => Promise.resolve(),
  hook: (_event: string, _cb: () => void) => {},
} as never

describe('HMR broadcast', () => {
  let db: LocalDevelopmentDatabase

  beforeAll(async () => {
    await initiateValidatorsContext()
    await fs.mkdir(contentDir, { recursive: true })
    await fs.writeFile(join(contentDir, 'index.md'), '# Home\n')
    db = await getLocalDatabase({ type: 'sqlite', filename: dbPath })
  })

  afterAll(async () => {
    await Promise.all(watchers.map(watcher => watcher.close()))
    db?.close()
    await fs.rm(rootDir, { recursive: true, force: true })
  })

  test('sends the update only after the manifest and dump templates are written', async () => {
    const collection = resolveCollection('content', defineCollection({ type: 'page', source: '**' }))!
    for (const stmt of generateCollectionTableDefinition(collection, { drop: true }).split('\n')) {
      await db.exec(stmt)
    }
    for (const source of collection.source!) {
      await source.prepare?.({ rootDir })
    }
    const manifest: Manifest = { collections: [collection], dump: { content: [] }, checksum: {}, checksumStructure: {}, components: [] }

    watchContents(nuxtMock, { _localDatabase: { type: 'sqlite' as const, filename: dbPath }, experimental: {} } as never, manifest)
    await new Promise(resolve => watchers[0]!.once('ready', resolve))

    let updates = 0
    const stopListening = contentHooks.hook('hmr:content:update', () => {
      updates++
    })

    try {
      await fs.writeFile(join(contentDir, 'index.md'), '# Home updated\n')
      await vi.waitFor(() => expect(templates.calls).toBe(1), { timeout: 10_000 })
      // A client fetches the dump as soon as it hears the update, so the update must wait for the write.
      expect(updates, 'update sent while the dump template was still being written').toBe(0)

      templates.finish()
      await vi.waitFor(() => expect(updates).toBe(1))
    }
    finally {
      stopListening()
      templates.finish()
    }
  }, 20_000)
})
