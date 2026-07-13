import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { readContentConfigSources } from '../src/runtime/v3/content-config'

const configPath = fileURLToPath(new URL('./fixtures/content-config/content.config.ts', import.meta.url))

function loadSources() {
  // `cwd`/`rootDir` are derived from the (absolute) config path.
  return readContentConfigSources(configPath)
}

describe('readContentConfigSources', () => {
  it('creates one source per collection, skipping collections without a source', async () => {
    const sources = loadSources()
    expect(Object.keys(sources).sort()).toEqual([
      'agencies',
      'blog',
      'custom',
      'docs',
      'index',
      'landing',
      'raw',
      'remote',
    ])
    expect(sources.empty).toBeUndefined()
  })

  it('merges the descriptors of a collection with multiple sources under its name', async () => {
    const sources = loadSources()
    expect(sources.landing).toBeDefined()
    // `merge` unions the child sources' keys behind the single collection name.
    expect((await sources.landing.keys()).sort()).toEqual(['blog.yml', 'index.md'])
  })

  it('carries the source prefix through', async () => {
    const sources = loadSources()
    expect(sources.docs.prefix).toBe('/docs')
    expect(sources.remote.prefix).toBe('/remote')
    expect(sources.blog.prefix).toBeUndefined()
  })

  it('adopts the first descriptor prefix for a merged source', async () => {
    const sources = loadSources()
    expect(sources.landing.prefix).toBe('/landing')
  })

  it('converts a data collection zod schema without injecting page defaults', async () => {
    const sources = loadSources()
    // `index` is a `data` collection: only its own fields, no title/seo/navigation.
    expect(sources.index.schema).toEqual({
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
    })
    // Approximate conversion → schema drives types/columns but never filters.
    expect(sources.index.schemaValidation).toBe(false)
  })

  it('injects v3 default page fields and merges the user schema over them', async () => {
    const sources = loadSources()
    const schema = sources.blog.schema!
    // Default page fields...
    expect(schema.properties).toMatchObject({
      title: { type: 'string' },
      description: { type: 'string' },
      seo: { type: 'object' },
      navigation: { type: ['boolean', 'object'] },
      // ...plus the user's own fields.
      date: { type: 'string' },
      links: { type: 'array', items: { type: 'object' } },
      image: { type: 'string' },
    })
    // `title`/`description` come from the defaults; `date`/`links` are required
    // by the user schema; the optional `image` stays out.
    expect(schema.required?.sort()).toEqual(['date', 'description', 'links', 'title'])
  })

  it('injects page defaults even when a page collection has no schema', async () => {
    const sources = loadSources()
    expect(sources.docs.schema).toMatchObject({
      type: 'object',
      properties: { title: { type: 'string' }, description: { type: 'string' }, seo: { type: 'object' } },
      required: ['title', 'description'],
    })
  })

  it('applies the collection schema (with page defaults) to a merged source', async () => {
    const sources = loadSources()
    expect(sources.landing.schema).toMatchObject({
      type: 'object',
      properties: { title: { type: 'string' }, description: { type: 'string' } },
      required: ['title', 'description'],
    })
  })

  it('leaves the schema undefined for a data collection that declares none', async () => {
    const sources = loadSources()
    expect(sources.raw.schema).toBeUndefined()
  })

  it('resolves a string glob source against the default content directory', async () => {
    const sources = loadSources()
    expect(await sources.blog.keys()).toEqual(expect.arrayContaining(['a.md', 'b.md']))
  })

  it('resolves a single-file string source', async () => {
    const sources = loadSources()
    expect(await sources.index.keys()).toEqual(['index.yml'])
  })

  it('applies the rebased exclude patterns', async () => {
    const sources = loadSources()
    const keys = await sources.docs.keys()
    expect(keys).toContain('a.md')
    expect(keys).not.toContain('data.json')
  })

  it('resolves an explicit relative cwd against the root directory', async () => {
    const sources = loadSources()
    // `cwd: './content/docs'` reads that directory directly (no exclude here).
    expect((await sources.custom.keys()).sort()).toEqual(['a.md', 'data.json'])
  })

  it('reads a nested glob directory', async () => {
    const sources = loadSources()
    expect(await sources.agencies.keys()).toEqual(['x.md'])
  })

  it('builds a GitHub source for a `repository` descriptor', async () => {
    const sources = loadSources()
    // GitHub sources expose a raw byte reader in addition to the base surface.
    expect(typeof sources.remote.keys).toBe('function')
    expect(typeof sources.remote.getItemRaw).toBe('function')
  })

  it('derives the root directory from the config file location', async () => {
    const sources = readContentConfigSources(configPath)
    expect(await sources.index.keys()).toEqual(['index.yml'])
  })

  it('resolves a relative config path against a `file://` cwd', async () => {
    const sources = readContentConfigSources('fixtures/content-config/content.config.ts', { cwd: import.meta.url })
    expect(await sources.index.keys()).toEqual(['index.yml'])
  })

  it('resolves a relative config path against a directory cwd', async () => {
    const cwd = fileURLToPath(new URL('./fixtures/content-config', import.meta.url))
    const sources = readContentConfigSources('content.config.ts', { cwd })
    expect(await sources.index.keys()).toEqual(['index.yml'])
  })
})
