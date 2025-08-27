import { describe, it, expect } from 'vitest'
import { z } from 'zod/v4'
import { z as localZ, getEditorOptions, zodToStandardSchema } from '../../src/utils/zod'
import { pageSchema } from '../../src/utils/schema'

interface WithEditor { editor(o: { input: 'icon' }): { _def: unknown } }
const editorSchema = (localZ.string() as unknown as WithEditor).editor({ input: 'icon' })

const nullableSchema = z.object({ title: z.string().nullable() })

describe('zod raw toJSONSchema passthrough', () => {
  it('preserves editor metadata via helper', () => {
    const meta = getEditorOptions(editorSchema as unknown as import('zod/v4').ZodTypeAny)
    expect(meta).toBeDefined()
    expect(meta).toMatchObject({ input: 'icon' })
  })

  it('keeps nullable field in required and anyOf from zod.toJSONSchema', () => {
    const std = zodToStandardSchema(nullableSchema, 'Test')
    const def = std.definitions.Test
    expect(def.required).toContain('title')
    const titleProp = (def.properties as Record<string, unknown>).title as { anyOf: Array<{ type: string }> }
    expect(titleProp.anyOf).toBeDefined()
    const anyOfTypes = titleProp.anyOf.map(p => p.type)
    expect(anyOfTypes).toContain('string')
    expect(anyOfTypes).toContain('null')
  })

  it('retains navigation union anyOf members unchanged', () => {
    const std = zodToStandardSchema(pageSchema, 'Page')
    const def = std.definitions.Page
    const navigationProp = (def.properties as Record<string, unknown>).navigation as { anyOf: Array<{ type: string }> }
    expect(navigationProp.anyOf).toBeDefined()
    const types = navigationProp.anyOf.map(p => p.type).sort()
    expect(types).toEqual(['boolean', 'object'])
  })

  it('retains seo allOf composition', () => {
    const std = zodToStandardSchema(pageSchema, 'Page')
    const def = std.definitions.Page
    const seoProp = (def.properties as Record<string, unknown>).seo as { allOf: unknown[] }
    expect(seoProp.allOf).toBeDefined()
    expect(Array.isArray(seoProp.allOf)).toBe(true)
    expect(seoProp.allOf.length).toBe(2)
  })
})
