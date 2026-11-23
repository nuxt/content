import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Nuxt } from 'nuxt/schema'

const kit = vi.hoisted(() => ({
  // `undefined` runs the real `ensureDependencyInstalled`.
  installed: true as boolean | undefined,
  warn: vi.fn(),
}))

vi.mock('@nuxt/kit', async (importOriginal) => {
  const original = await importOriginal<typeof import('@nuxt/kit')>()
  return {
    ...original,
    ensureDependencyInstalled: vi.fn(async (...args: Parameters<typeof original.ensureDependencyInstalled>) => kit.installed ?? original.ensureDependencyInstalled(...args)),
    useLogger: () => ({ warn: kit.warn }),
  }
})

const { runWithNuxtContext } = await import('@nuxt/kit')
const { resolveHighlightOptions } = await import('../src/utils/highlight')

const nuxt = { options: { rootDir: process.cwd(), modulesDir: [], _prepare: false } } as unknown as Nuxt

describe('resolveHighlightOptions', () => {
  beforeEach(() => {
    kit.installed = true
    kit.warn.mockClear()
  })

  it('is disabled when highlight is not configured', async () => {
    expect(await resolveHighlightOptions(undefined, nuxt)).toBe(false)
    expect(await resolveHighlightOptions(false, nuxt)).toBe(false)
  })

  it('warns and disables highlighting when shiki is not installed', async () => {
    kit.installed = false
    expect(await resolveHighlightOptions({ theme: 'github-dark' }, nuxt)).toBe(false)
    expect(kit.warn).toHaveBeenCalledWith(expect.stringContaining('Install `shiki`'))
  })

  it('maps the v3 `default`/`dark` themes to light/dark', async () => {
    const resolved = await resolveHighlightOptions({ theme: { default: 'github-light', dark: 'github-dark' } }, nuxt)
    expect(resolved && resolved.themes).toEqual({ light: 'github-light', dark: 'github-dark' })
  })

  it('accepts a single theme name and extra languages', async () => {
    const resolved = await resolveHighlightOptions({ theme: 'nord', langs: ['python'], preload: ['rust'] }, nuxt)
    expect(resolved && resolved.themes).toEqual({ light: 'nord', dark: undefined })
    expect(resolved && resolved.langs).toEqual(expect.arrayContaining(['ts', 'vue', 'python', 'rust']))
  })

  it('drops unknown themes and languages with a warning', async () => {
    const resolved = await resolveHighlightOptions({ theme: { default: 'not-a-theme' }, langs: ['not-a-lang'] }, nuxt)
    expect(resolved && resolved.themes.light).toBeUndefined()
    expect(resolved && resolved.langs).not.toContain('not-a-lang')
    expect(kit.warn).toHaveBeenCalledTimes(2)
  })

  describe('with `shiki` installed outside the project', () => {
    // Out of the repository, so `shiki` doesn't resolve from the repository's own `node_modules`.
    const root = mkdtempSync(join(tmpdir(), 'content-highlight-'))
    const rootDir = join(root, 'app')
    const layerModules = join(root, 'layer/node_modules')
    mkdirSync(rootDir)
    mkdirSync(layerModules, { recursive: true })
    // pnpm installs a layer's dependencies in the layer's own `node_modules`.
    symlinkSync(realpathSync('node_modules/shiki'), join(layerModules, 'shiki'))

    // Run as Nuxt does, where `ensureDependencyInstalled` also reads `modulesDir` from the Nuxt context.
    const resolveWith = (modulesDir: string[]) => {
      const nuxt = { options: { rootDir, modulesDir, _prepare: true } } as unknown as Nuxt
      return runWithNuxtContext(nuxt, () => resolveHighlightOptions({ theme: 'github-light' }, nuxt))
    }

    beforeEach(() => {
      kit.installed = undefined
    })
    afterAll(() => rmSync(root, { recursive: true, force: true }))

    it('loads `shiki` from a layer\'s `modulesDir`', async () => {
      const resolved = await resolveWith([join(rootDir, 'node_modules'), layerModules])
      expect(resolved && resolved.themes).toEqual({ light: 'github-light', dark: undefined })
      expect(kit.warn).not.toHaveBeenCalled()
    })

    it('warns instead of crashing when no `modulesDir` has `shiki`', async () => {
      expect(await resolveWith([join(rootDir, 'node_modules')])).toBe(false)
      expect(kit.warn).toHaveBeenCalledWith(expect.stringContaining('Install `shiki`'))
    })
  })
})
