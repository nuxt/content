import { eventHandler } from 'h3'

export default eventHandler(async () => {
  // @ts-expect-error - Vite doesn't know about the import
  const dump: string = await import('#content-v3/dump' /* @vite-ignore */).then(m => m.default)
  // @ts-expect-error - Vite doesn't know about the import
  const collections = await import('#content-v3/collections' /* @vite-ignore */).then(m => m.collections)

  return {
    collections: collections.reduce((acc, col) => {
      acc[col.name] = {
        jsonFields: col.jsonFields,
      }
      return acc
    }, {} as Record<string, Array<string>>),
    dump,
  }
})
