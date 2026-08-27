import { describe, expect, test } from 'vitest'
import type { Nuxt } from '@nuxt/schema'
import type { Resolver } from '@nuxt/kit'
import vercelPreset from '../../src/presets/vercel'
import type { ModuleOptions } from '../../src/types/module'

const resolver = { resolve: (p: string) => p } as unknown as Resolver
// Empty manifest so the inherited node preset doesn't register server handlers
// (which would require a live Nuxt context).
const opts = { resolver, manifest: { collections: [] } as never }

function createNuxt(nitro: Record<string, unknown>): Nuxt {
  return { options: { nitro } } as unknown as Nuxt
}

describe('vercel preset bun runtime detection', () => {
  test('auto-selects the bun connector when the Vercel function runtime is bun', async () => {
    const options = {} as ModuleOptions
    await vercelPreset.setup!(options, createNuxt({ vercel: { functions: { runtime: 'bun1.x' } } }), opts)

    expect(options.experimental?.sqliteConnector).toBe('bun')
    expect(options.database).toEqual({ type: 'sqlite', filename: '/tmp/contents.sqlite' })
  })

  test('matches any bun-prefixed runtime version', async () => {
    const options = {} as ModuleOptions
    await vercelPreset.setup!(options, createNuxt({ vercel: { functions: { runtime: 'bun' } } }), opts)

    expect(options.experimental?.sqliteConnector).toBe('bun')
  })

  test('does not set the bun connector for a Node.js runtime', async () => {
    const options = {} as ModuleOptions
    await vercelPreset.setup!(options, createNuxt({ vercel: { functions: { runtime: 'nodejs20.x' } } }), opts)

    expect(options.experimental?.sqliteConnector).toBeUndefined()
  })

  test('does not set the bun connector when no Vercel runtime is configured', async () => {
    const options = {} as ModuleOptions
    await vercelPreset.setup!(options, createNuxt({}), opts)

    expect(options.experimental?.sqliteConnector).toBeUndefined()
  })

  test('does not override an explicitly configured connector', async () => {
    const options = { experimental: { sqliteConnector: 'better-sqlite3' } } as ModuleOptions
    await vercelPreset.setup!(options, createNuxt({ vercel: { functions: { runtime: 'bun1.x' } } }), opts)

    expect(options.experimental?.sqliteConnector).toBe('better-sqlite3')
  })
})
