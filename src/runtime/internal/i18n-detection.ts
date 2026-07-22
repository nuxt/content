import type { H3Event } from 'h3'

/**
 * Minimal type view of the per-request context that `@nuxtjs/i18n` (v10+)
 * attaches to H3 events. Kept intentionally narrow, since only the two fields
 * read below are needed and pinning a precise type would tightly couple this
 * module to an upstream package declared as a soft (optional) integration.
 *
 * Authoritative shape: https://github.com/nuxt-modules/i18n/blob/main/src/runtime/server/context.ts
 */
interface NuxtI18nServerContext {
  /**
   * Per-request resolved locale. Written by `@nuxtjs/i18n` v10+ inside the
   * `render:before` hook of its Nitro plugin (`src/runtime/server/plugin.ts`),
   * but only when a server-side localized redirect actually fires (gated by
   * `experimental.nitroContextDetection`, default `true`).
   *
   * For a request that already lands on the correct localized URL such as
   * `/fr/about` for a French user, this stays `undefined`. The fallback to
   * `vueI18nOptions.locale` (the configured default) is what `detectServerLocale`
   * ultimately returns in that case.
   *
   * Practical implication, inside a server event handler reached via a
   * non-redirected localized URL, prefer an explicit `.locale(<code>)` rather
   * than relying on auto-detection. Otherwise queries default to the configured
   * default locale.
   */
  detectLocale?: string
  /** Configured vue-i18n options. `vueI18nOptions.locale` is the configured default locale. */
  vueI18nOptions?: { locale?: string }
}

/**
 * Resolve the active locale on the server from `@nuxtjs/i18n`'s event context.
 *
 * Priority is `detectLocale` (set only during server-side localized redirects),
 * then `vueI18nOptions.locale` (the configured default). Returns `undefined`
 * when `@nuxtjs/i18n` is not installed or its context has not been initialised.
 *
 * Because `detectLocale` is unset for the common case of a normal non-redirected
 * request, this often returns the configured default locale rather than the
 * user's per-request locale. In event handlers where the active locale matters,
 * call `.locale()` explicitly.
 */
export function detectServerLocale(event: H3Event | undefined): string | undefined {
  const ctx = event?.context?.nuxtI18n as NuxtI18nServerContext | undefined
  return ctx?.detectLocale || ctx?.vueI18nOptions?.locale
}

/**
 * Resolve the active locale on the client from `nuxtApp.$i18n.locale` (a Vue ref).
 * Returns `undefined` when `@nuxtjs/i18n` is not installed.
 *
 * The parameter is typed as `unknown` because Nuxt's `NuxtApp` does not declare
 * `$i18n` natively (it is a runtime plugin injection). A narrower type would have
 * no overlap with `NuxtApp` and force callers into an awkward cast.
 */
export function detectClientLocale(nuxtApp: unknown): string | undefined {
  const i18n = (nuxtApp as { $i18n?: { locale?: { value?: string } } } | null | undefined)?.$i18n
  return i18n?.locale?.value
}

/**
 * Pure builder for `useQueryCollection`'s cache key. Extracted so it can be
 * unit-tested without spinning up a Nuxt app instance. The output shape must
 * stay stable, since Nuxt reuses `useAsyncData` entries by key and any change
 * here invalidates user caches on upgrade.
 *
 * `localeFallback` wins over `currentLocale`. When the consumer set
 * `.locale(x, { fallback })` explicitly, the auto-detected locale is
 * irrelevant. `currentLocale` is only added when no explicit `.locale()` (or
 * `.where('locale', ...)`) was used.
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
