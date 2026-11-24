import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, it, expect } from 'vitest'
import { loadNuxtConfig } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { resolveContentEntry } from '../src/utils/config'

let rootDir: string

afterEach(() => rmSync(rootDir, { recursive: true, force: true }))

/** A project extending `./layer`, with the given files. */
async function resolveEntry(files: string[], compatibilityVersion: 3 | 4 = 3) {
  rootDir = mkdtempSync(join(tmpdir(), 'content-entry-'))
  for (const file of ['nuxt.config.ts', 'layer/nuxt.config.ts', ...files]) {
    mkdirSync(dirname(join(rootDir, file)), { recursive: true })
    writeFileSync(join(rootDir, file), file === 'nuxt.config.ts' ? `export default { extends: ['./layer'] }` : `export default {}`)
  }
  const options = await loadNuxtConfig({ cwd: rootDir })
  return resolveContentEntry({ options } as Nuxt, compatibilityVersion)
}

describe('resolveContentEntry', () => {
  it('uses the `server/content.ts` of a layer', async () => {
    expect(await resolveEntry(['layer/server/content.ts'])).toEqual({ type: 'server', path: join(rootDir, 'layer/server/content') })
  })

  it('prefers the project\'s `server/content.ts`', async () => {
    expect(await resolveEntry(['server/content.ts', 'layer/server/content.ts'])).toEqual({ type: 'server', path: join(rootDir, 'server/content') })
  })

  it('prefers a layer\'s `server/content.ts` over the project\'s v3 `content.config.ts`', async () => {
    expect(await resolveEntry(['content.config.ts', 'layer/server/content.ts'])).toEqual({ type: 'server', path: join(rootDir, 'layer/server/content') })
  })

  it('merges the v3 `content.config.ts` of every layer without a `server/content.ts`', async () => {
    expect(await resolveEntry(['content.config.ts', 'layer/content.config.ts'])).toEqual({
      type: 'config',
      paths: [join(rootDir, 'layer/content.config.ts'), join(rootDir, 'content.config.ts')],
    })
  })

  it('ignores v3 `content.config.ts` files with `compatibilityVersion: 4`', async () => {
    expect(await resolveEntry(['content.config.ts'], 4)).toEqual({ type: 'fallback' })
  })
})
