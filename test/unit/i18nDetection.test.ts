import { describe, it, expect } from 'vitest'
import { detectClientLocale } from '../../src/runtime/internal/i18n-detection'
import { ref } from 'vue'

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

  it('reads $i18n.locale as a string in vue-i18n legacy mode', () => {
    expect(detectClientLocale({ $i18n: { locale: 'fr' } })).toBe('fr')
  })
})
