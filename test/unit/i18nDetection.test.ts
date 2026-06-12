import { describe, it, expect } from 'vitest'
import {
  buildUseQueryCollectionKey,
  detectClientLocale,
  detectServerLocale,
} from '../../src/runtime/internal/i18n-detection'
import { ref } from 'vue'

describe('detectServerLocale', () => {
  it('returns undefined when no event is provided', () => {
    expect(detectServerLocale(undefined)).toBeUndefined()
  })

  it('returns undefined when event.context.nuxtI18n is absent', () => {
    // Empty context. Either `@nuxtjs/i18n` is not installed, or its middleware
    // did not run for this request.
    const event = { context: {} } as never
    expect(detectServerLocale(event)).toBeUndefined()
  })

  it('prefers `detectLocale` (per-request resolved locale)', () => {
    const event = { context: { nuxtI18n: { detectLocale: 'fr', vueI18nOptions: { locale: 'en' } } } } as never
    expect(detectServerLocale(event)).toBe('fr')
  })

  it('falls back to `vueI18nOptions.locale` when detection did not run', () => {
    // Mirrors the case where a prerender or a route outside the i18n middleware
    // lacks `detectLocale`.
    const event = { context: { nuxtI18n: { vueI18nOptions: { locale: 'en' } } } } as never
    expect(detectServerLocale(event)).toBe('en')
  })
})

describe('detectClientLocale', () => {
  it('returns undefined when nuxtApp is null', () => {
    expect(detectClientLocale(null)).toBeUndefined()
  })

  it('returns undefined when $i18n is absent', () => {
    expect(detectClientLocale({})).toBeUndefined()
  })

  it('reads $i18n.locale (a Vue ref)', () => {
    const locale = ref('de')
    expect(detectClientLocale({ $i18n: { locale } })).toBe('de')
  })
})

describe('buildUseQueryCollectionKey', () => {
  const baseParts = {
    collection: 'docs',
    conditions: [] as string[],
    orderBy: [] as string[],
    offset: 0,
    limit: 0,
    selectedFields: [] as string[],
    explicitLocale: false,
    method: 'all',
  }

  it('produces a stable shape for the trivial case', () => {
    const key = buildUseQueryCollectionKey(baseParts)
    expect(key).toBe('content:["docs","all"]')
  })

  it('includes auto-detected locale when no explicit .locale() was set', () => {
    const key = buildUseQueryCollectionKey({ ...baseParts, currentLocale: 'fr' })
    expect(key).toContain('"l:fr"')
  })

  it('OMITS auto-detected locale when explicitLocale is true', () => {
    // Regression. A manual `.where('locale', ...)` or `.locale()` call must
    // suppress the auto-locale fragment so the wrapper key matches the actual
    // SQL behaviour.
    const key = buildUseQueryCollectionKey({ ...baseParts, currentLocale: 'fr', explicitLocale: true })
    expect(key).not.toContain('l:fr')
  })

  it('emits a fallback fragment when localeFallback is set, ignoring currentLocale', () => {
    const key = buildUseQueryCollectionKey({
      ...baseParts,
      currentLocale: 'de',
      localeFallback: { locale: 'fr', fallback: 'en' },
    })
    expect(key).toContain('"l:fr:fb:en"')
    expect(key).not.toContain('l:de')
  })

  it('preserves the relative order of fragments (cache key is order-sensitive)', () => {
    const key = buildUseQueryCollectionKey({
      ...baseParts,
      conditions: ['path=/foo'],
      orderBy: ['date:DESC'],
      offset: 10,
      limit: 5,
      selectedFields: ['title', 'date'],
      currentLocale: 'fr',
    })
    // Expected fragment order: `collection`, `conditions`, `locale`, `orderBy`,
    // `offset`, `limit`, `selectedFields`, `method`.
    const parsed = JSON.parse(key.slice('content:'.length)) as string[]
    expect(parsed).toEqual([
      'docs',
      'path=/foo',
      'l:fr',
      'o:date:DESC',
      's:10',
      'n:5',
      'f:title,date',
      'all',
    ])
  })

  it('returns identical keys for inputs that produce identical SQL', () => {
    // Demonstrates the contract. Equal inputs (including equivalent
    // normalization upstream) produce equal keys.
    const a = buildUseQueryCollectionKey({ ...baseParts, conditions: ['path=/foo'] })
    const b = buildUseQueryCollectionKey({ ...baseParts, conditions: ['path=/foo'] })
    expect(a).toBe(b)
  })
})
