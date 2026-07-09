export function importMetaTypesTemplate() {
  return `declare global {
interface ImportMeta {
/** Nuxt project root directory. Use this to resolve paths relative to the project root in your CMS configuration. */
readonly rootDir: string
readonly content: {
/** When true, v3 query/search composables are enabled and sql-query + FTS plugins are injected into the CMS. */
readonly v3Compatibility: boolean
}
}
}

export {}
`
}
