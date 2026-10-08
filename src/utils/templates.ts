export function importMetaTypesTemplate() {
  return `declare global {
interface ImportMeta {
/** Nuxt project root directory. Use this to resolve paths relative to the project root in your content configuration. */
readonly rootDir: string
readonly content: {
/** When true, v3 query/search composables are enabled and sql-query + FTS plugins are injected into the Content instance. */
readonly v3Compatibility: boolean
/** Collections resolved at build time from the v3 \`content.config.ts\` of every layer. */
readonly collections: import('@nuxt/content/v3').ResolvedContentCollections
}
}
}

export {}
`
}
