import type { CollectionInfo, DraftSyncFile } from '@nuxt/content'

export const v2ToV3ParsedFile = (file: DraftSyncFile, collection: CollectionInfo) => {
  const mappedFile: Record<string, unknown> = {
    id: file.parsed._id,
    stem: file.parsed._stem,
    meta: {},
    extension: file.parsed._extension,
    path: file.parsed._path,
  }

  const properties = collection.schema.definitions[collection.name].properties

  // Map parsed content to collection schema
  Object.keys(file.parsed).forEach((key) => {
    if (key in properties) {
      mappedFile[key] = file.parsed[key]
    }
    else {
      (mappedFile.meta as Record<string, unknown>)[key] = file.parsed[key]
    }
  })

  return mappedFile
}
