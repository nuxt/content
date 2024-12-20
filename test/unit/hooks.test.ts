import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineCollection } from '../../src/utils'
import { resolveCollection } from '../../src/utils/collection'
import type { ContentParsedHook } from '../../src/types'
import { parseContent } from '../utils/content'

describe('Hooks', () => {
  const collection = resolveCollection('hookTest', defineCollection({
    type: 'data',
    source: 'content/**',
    schema: z.object({
      body: z.any(),
      foo: z.any(),
    }),
  }))!
  it('collection:parsedFile', async () => {
    let hookCtx: ContentParsedHook
    const nuxtMock = {
      callHook(hook: string, ctx: ContentParsedHook) {
        if (hook === 'collection:parsedFile') {
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
})
