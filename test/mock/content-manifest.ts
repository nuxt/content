export const tables = {
  test: '_content_test',
  info: '_content_info',
}

export const checksums: Record<string, string> = {}
export const checksumsStructure: Record<string, string> = {}

// Mirrors the generated `#content/manifest` default export (`ManifestCollectionsMeta`).
// The query builder reads per-collection metadata (type, fields and i18n config) from it.
const manifest: Record<string, { type: 'data' | 'page', fields: Record<string, string> }> = {
  test: { type: 'data', fields: { id: 'string', title: 'string' } },
}

export default manifest
