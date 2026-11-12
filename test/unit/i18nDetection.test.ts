import { describe, it, expect } from 'vitest'
import { detectClientLocale, detectServerLocale } from '../../src/runtime/internal/i18n-detection'
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
