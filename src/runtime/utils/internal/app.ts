export function getTableName(collection: string) {
  return `content_${collection}`
}

export function getCollectionName(table: string) {
  return table.replace(/^content_/, '')
}
