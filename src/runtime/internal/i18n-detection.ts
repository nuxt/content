import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/**
 * Read the active locale from `nuxtApp.$i18n.locale`, which `@nuxtjs/i18n`
 * resolves per request during SSR and keeps reactive on the client. It is a ref,
 * or a string with vue-i18n in legacy mode. Returns `undefined` when
 * `@nuxtjs/i18n` is not installed.
 *
 * Typed as `unknown` because `NuxtApp` does not declare the `$i18n` plugin injection.
 */
export function detectClientLocale(nuxtApp: unknown): string | undefined {
  const locale = unref((nuxtApp as { $i18n?: { locale?: MaybeRef<string | undefined> } } | null | undefined)?.$i18n?.locale)
  return typeof locale === 'string' ? locale : undefined
}
