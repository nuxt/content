import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Nuxt } from 'nuxt/schema'

const kit = vi.hoisted(() => ({
  installed: true,
  warn: vi.fn(),
}))

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  ensureDependencyInstalled: vi.fn(async () => kit.installed),
  useLogger: () => ({ warn: kit.warn }),
}))

const { resolveHighlightOptions } = await import('../src/utils/highlight')

const nuxt = { options: { rootDir: process.cwd(), _prepare: false } } as unknown as Nuxt

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
})
