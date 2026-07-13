import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { readContentConfigSources } from '../src/runtime/v3/content-config'

const rootDir = fileURLToPath(new URL('./fixtures/content-config', import.meta.url))
const configPath = fileURLToPath(new URL('./fixtures/content-config/content.config.ts', import.meta.url))

function loadSources() {
  return readContentConfigSources(configPath, { rootDir })
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

  it('does not convert the zod schema — Comark infers it from content', async () => {
    const sources = loadSources()
    expect(sources.index.schema).toBeUndefined()
    expect(sources.blog.schema).toBeUndefined()
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

  it('defaults the root directory to the config file location', async () => {
    const sources = readContentConfigSources(configPath)
    expect(await sources.index.keys()).toEqual(['index.yml'])
  })
})
