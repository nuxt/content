export function importMetaTypesTemplate() {
  return `declare global {
interface ImportMeta {
/** Nuxt project root directory. Use this to resolve paths relative to the project root in your content configuration. */
readonly rootDir: string
readonly content: {
/** When true, v3 query/search composables are enabled and sql-query + FTS plugins are injected into the Content instance. */
readonly v3Compatibility: boolean
/** Absolute paths of the v3 \`content.config.ts\` files found across layers, lowest priority first. */
readonly configPaths: string[]
}
}
}

export {}
`
}
