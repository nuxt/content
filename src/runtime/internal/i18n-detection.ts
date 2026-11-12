/**
 * Read the active locale from `nuxtApp.$i18n.locale`, which `@nuxtjs/i18n`
 * resolves per request during SSR and keeps reactive on the client. Returns
 * `undefined` when `@nuxtjs/i18n` is not installed.
 *
 * Typed as `unknown` because `NuxtApp` does not declare the `$i18n` plugin injection.
 */
export function detectClientLocale(nuxtApp: unknown): string | undefined {
  const i18n = (nuxtApp as { $i18n?: { locale?: { value?: string } } } | null | undefined)?.$i18n
  return i18n?.locale?.value
}
