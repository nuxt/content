export function highlightTypesTemplate() {
  return `declare module '#content/highlight' {
  export const highlight: import('comark').ComarkPlugin | undefined
}
`
}

export function importMetaTypesTemplate() {
  return `declare global {
interface ImportMeta {
/** Nuxt project root directory. Use this to resolve paths relative to the project root in your content configuration. */
readonly rootDir: string
readonly content: {
/** Resolved \`content.compatibilityVersion\`. With \`3\`, v3 query/search composables are enabled and sql-query + FTS plugins are injected into the Content instance. */
readonly compatibilityVersion: 3 | 4
/** Names of the content instances, defined for \`app/content.ts\` in the app build. */
readonly sources: string[]
/** Collections resolved at build time from the v3 \`content.config.ts\` of every layer. */
readonly collections: import('@nuxt/content/v3').ResolvedContentCollections
/** Resolved \`content.build.markdown.highlight\` options, \`false\` when highlighting is disabled. */
readonly highlight: false | { themes: { light?: string, dark?: string }, langs: string[] }
/** Resolved \`content.build.markdown.toc\` options. */
readonly toc: { depth: number, searchDepth: number }
/** Heading tags that link to themselves, resolved from \`content.renderer.anchorLinks\`. */
readonly anchorLinks: string[]
}
}
}

export {}
`
}
