export function importMetaTypesTemplate() {
  return `declare global {
interface ImportMeta {
/** Nuxt project root directory. Use this to resolve paths relative to the project root in your CMS configuration. */
readonly rootDir: string
}
}

export {}
`
}
