import type { H3Event } from 'h3'

/**
 * Minimal type view of the per-request context that `@nuxtjs/i18n` (>= v10)
 * attaches to H3 events. Kept narrow on purpose: we only read the two fields
 * we need, and pinning a precise type would couple us to an upstream module
 * that we declare as a soft (optional) integration.
 *
 * Authoritative shape:
 * https://github.com/nuxt-modules/i18n/blob/main/src/runtime/server/context.ts
 */
interface NuxtI18nServerContext {
  /** Per-request resolved locale. Set by `@nuxtjs/i18n >= 10` after route-locale-detect runs. */
  detectLocale?: string
  /** Configured vue-i18n options. `vueI18nOptions.locale` is the configured default locale. */
  vueI18nOptions?: { locale?: string }
}

/**
 * Resolve the active locale on the server from `@nuxtjs/i18n`'s event context.
 *
 * Priority: `detectLocale` (per-request resolved) → `vueI18nOptions.locale` (configured default).
 * Returns `undefined` when `@nuxtjs/i18n` isn't installed or its context hasn't been initialized
 * (e.g. routes outside the i18n middleware, or prerender without detection).
 */
export function detectServerLocale(event: H3Event | undefined): string | undefined {
  const ctx = event?.context?.nuxtI18n as NuxtI18nServerContext | undefined
  return ctx?.detectLocale || ctx?.vueI18nOptions?.locale
}

/**
 * Resolve the active locale on the client from `nuxtApp.$i18n.locale` (a Vue ref).
 * Returns `undefined` when `@nuxtjs/i18n` isn't installed.
 *
 * Typed as `unknown` because Nuxt's `NuxtApp` doesn't declare `$i18n` natively —
 * it's a runtime plugin injection. A narrower parameter type would have no overlap
 * with `NuxtApp` and force callers into an awkward cast.
 */
export function detectClientLocale(nuxtApp: unknown): string | undefined {
  const i18n = (nuxtApp as { $i18n?: { locale?: { value?: string } } } | null | undefined)?.$i18n
  return i18n?.locale?.value
}

/**
 * Pure builder for `useQueryCollection`'s cache key. Extracted so it can be unit-tested
 * without spinning up a Nuxt app instance. The shape must stay stable: Nuxt re-uses
 * AsyncData entries by key, so changing this format invalidates user caches on upgrade.
 *
 * `localeFallback` wins over `currentLocale`: when the consumer set `.locale(x, { fallback })`
 * explicitly, the auto-detected locale is irrelevant. `currentLocale` is only added when no
 * explicit `.locale()` (or `.where('locale', ...)`) was used.
 */
export interface UseQueryCollectionKeyParts {
  collection: string
  conditions: string[]
  orderBy: string[]
  offset: number
  limit: number
  selectedFields: string[]
  localeFallback?: { locale: string, fallback: string }
  currentLocale?: string
  explicitLocale: boolean
  method: string
}

export function buildUseQueryCollectionKey(parts: UseQueryCollectionKeyParts): string {
  const fragments: string[] = [parts.collection]
  if (parts.conditions.length) fragments.push(...parts.conditions)
  if (parts.localeFallback) {
    fragments.push(`l:${parts.localeFallback.locale}:fb:${parts.localeFallback.fallback}`)
  }
  else if (parts.currentLocale && !parts.explicitLocale) {
    fragments.push(`l:${parts.currentLocale}`)
  }
  if (parts.orderBy.length) fragments.push(`o:${parts.orderBy.join(',')}`)
  if (parts.offset) fragments.push(`s:${parts.offset}`)
  if (parts.limit) fragments.push(`n:${parts.limit}`)
  if (parts.selectedFields.length) fragments.push(`f:${parts.selectedFields.join(',')}`)
  fragments.push(parts.method)
  return `content:${JSON.stringify(fragments)}`
}
