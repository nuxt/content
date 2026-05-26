import fs from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { defineCollection } from '../src/utils'
import { generateCollectionTableDefinition, resolveCollection } from '../src/utils/collection'
import { contentHooks, watchContents } from '../src/utils/dev'
import { getLocalDatabase } from '../src/utils/database'
import { initiateValidatorsContext } from '../src/utils/dependencies'
import type { LocalDevelopmentDatabase } from '../src/module'
import type { Manifest } from '../src/types/manifest'

const rootDir = join(tmpdir(), 'nuxt-content-hmr-test-' + Date.now())
const contentDir = join(rootDir, 'content')
const dbPath = join(rootDir, 'contents.sqlite')

const nuxtMock = {
  options: { rootDir, buildDir: join(rootDir, '.nuxt') },
  callHook: () => Promise.resolve(),
  hook: (_event: string, _cb: () => void) => {},
} as never

describe('multi-collection HMR — file matched by multiple collections', async () => {
  await initiateValidatorsContext()

  let db: LocalDevelopmentDatabase

  beforeAll(async () => {
    await fs.mkdir(join(contentDir, 'blog'), { recursive: true })
    await fs.writeFile(join(contentDir, 'index.md'), '---\ntitle: Home\n---\n# Home\n')
    await fs.writeFile(join(contentDir, 'blog', 'hello.md'), '---\ntitle: Hello\n---\n# Hello\n')

    db = await getLocalDatabase({ type: 'sqlite', filename: dbPath })

    // Pre-create the collection tables so broadcast's DELETE/INSERT can run
    const tmpContent = resolveCollection('content', defineCollection({ type: 'page', source: '**' }))!
    const tmpBlog = resolveCollection('blog', defineCollection({ type: 'page', source: 'blog/**' }))!
    for (const col of [tmpContent, tmpBlog]) {
      for (const stmt of generateCollectionTableDefinition(col, { drop: true }).split('\n')) {
        await db.exec(stmt)
      }
    }
  })

  afterAll(async () => {
    db?.close()
    await fs.rm(rootDir, { recursive: true, force: true })
  })

  test('modifying a file that matches multiple collections updates all of them', async () => {
    // content: ** (catch-all)
    const contentCollection = resolveCollection('content', defineCollection({ type: 'page', source: '**' }))!
    // blog: blog/** (subset)
    const blogCollection = resolveCollection('blog', defineCollection({ type: 'page', source: 'blog/**' }))!

    // Populate source.cwd (normally done by module setup)
    for (const source of contentCollection.source!) {
      await source.prepare?.({ rootDir })
    }
    for (const source of blogCollection.source!) {
      await source.prepare?.({ rootDir })
    }

    const manifest: Manifest = {
      collections: [contentCollection, blogCollection],
      dump: { content: [], blog: [] },
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

    // Collect which collections received HMR updates
    const updatedCollections: string[] = []
    const stopListening = contentHooks.hook('hmr:content:update', ({ collection }) => {
      updatedCollections.push(collection)
    })

    // Modify blog/hello.md — it lives under blog/** AND under ** so both collections match
    const blogPost = join(contentDir, 'blog', 'hello.md')
    const original = await fs.readFile(blogPost, 'utf8')
    await fs.writeFile(blogPost, original.replace('# Hello', '# Hello Updated'))

    // Give the watcher time to detect, parse and broadcast (chokidar + async)
    await new Promise(resolve => setTimeout(resolve, 2000))

    stopListening()
    await fs.writeFile(blogPost, original) // restore

    expect(updatedCollections, 'both collections should have been notified').toContain('content')
    expect(updatedCollections, 'both collections should have been notified').toContain('blog')
  })
})
