import micromatch from 'micromatch'
import type { CollectionInfo } from '../../types/collection'
import type { DraftSyncFile } from '../../types/studio'
import { withoutRoot } from './files'

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

export const getCollectionByPath = (path: string, collections: Record<string, CollectionInfo>): CollectionInfo => {
  return Object.values(collections).find((collection) => {
    if (!collection.source) {
      return
    }

    return micromatch.isMatch(withoutRoot(path), collection.source.include, { ignore: collection.source.exclude || [], dot: true })
  })
}
