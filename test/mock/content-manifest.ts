export const tables = {
  test: '_content_test',
}

// The query builder imports the default export to read per-collection metadata
// (i18n config and stem prefix). Keep it in sync with `ManifestCollectionsMeta`.
export default {
  test: { type: 'data', fields: {} },
}
