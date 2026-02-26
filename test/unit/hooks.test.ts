import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import { parseContent } from '../utils/content'
import type { FileAfterParseHook, FileBeforeParseHook } from '../../src/types'
import { initiateValidatorsContext } from '../../src/utils/dependencies'
import type { Manifest } from '../../src/types/manifest'

describe('Hooks', async () => {
  await initiateValidatorsContext()
  const collection = resolveCollection('hookTest', defineCollection({
    type: 'data',
    source: 'content/**',
    schema: z.object({
      body: z.any(),
      foo: z.any(),
    }),
  }))!
  it('content:file:beforeParse', async () => {
    let hookCtx: FileBeforeParseHook
    const nuxtMock = {
      callHook(hook: string, ctx: FileBeforeParseHook) {
        if (hook === 'content:file:beforeParse') {
          ctx.file.body = ctx.file.body.replace('replace-me', 'bar')
          hookCtx = ctx
        }
      },
    }
    const content = await parseContent('content/index.md', `---
foo: 'replace-me'
---

  # Hello World
`, collection, nuxtMock)
    expect(hookCtx.file.id).toEqual('content/index.md')
    expect(content.foo).toEqual('bar')
  })
  it('content:file:afterParse', async () => {
    let hookCtx: FileAfterParseHook
    const nuxtMock = {
      callHook(hook: string, ctx: FileAfterParseHook) {
        if (hook === 'content:file:afterParse') {
          // augment
          ctx.content.bar = 'foo'
          hookCtx = ctx
        }
      },
    }
    const parsed = await parseContent('content/index.md', `---
foo: 'bar'
---

  # Hello World
`, collection, nuxtMock)
    expect(hookCtx.collection.name).toEqual('hookTest')
    expect(parsed.id).toEqual('content/index.md')
    expect(parsed.foo).toEqual('bar')
    expect(parsed.bar).toEqual('foo')
  })

  it('content:manifest mutations are reflected in manifest', async () => {
    const extraCollection = resolveCollection('injected', defineCollection({
      type: 'data',
      source: 'extra/**',
      schema: z.object({
        body: z.any(),
      }),
    }))!

    const manifest: Manifest = {
      checksumStructure: {},
      checksum: {},
      dump: {},
      components: [],
      collections: [collection],
    }

    // Simulate the module calling the hook
    const nuxtMock = {
      callHook(hook: string, ctx: Manifest) {
        if (hook === 'content:manifest') {
          ctx.collections.push(extraCollection)
        }
      },
    }

    nuxtMock.callHook('content:manifest', manifest)

    // must be visible on original manifest object
    expect(manifest.collections).toHaveLength(2)
    // new collection is visible
    expect(manifest.collections.find(c => c.name === 'injected')).toBeDefined()
    // original collection is still exists
    expect(manifest.collections.find(c => c.name === 'hookTest')).toBeDefined()
  })
})
