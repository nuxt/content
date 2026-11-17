import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/**
 * `@nuxtjs/i18n` resolves `$i18n.locale` per request during SSR and keeps it reactive on
 * the client. It is a ref, or a string with vue-i18n in legacy mode.
 */
export function detectClientLocale(nuxtApp: unknown): string | undefined {
  const locale = unref((nuxtApp as { $i18n?: { locale?: MaybeRef<string | undefined> } } | null | undefined)?.$i18n?.locale)
  return typeof locale === 'string' ? locale : undefined
}
