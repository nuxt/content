import type { CollectionInfo, DraftSyncFile, ResolvedCollectionSource } from '@nuxt/content'
import type { JsonSchema7ObjectType } from 'zod-to-json-schema'
import { join } from 'pathe'
import { parseSourceBase } from './utils'

export const v2ToV3ParsedFile = (file: DraftSyncFile, collection: CollectionInfo, source: ResolvedCollectionSource) => {
  const { fixed } = parseSourceBase(source)
  if (!file.parsed) {
    return undefined
  }
  const path = file.parsed._path!.substring(fixed.length)
  const pathInCollection = join(source?.prefix || '', path)

  // TODO - Handle data collections (remove path...)
  const mappedFile: Record<string, unknown> = {
    id: file.parsed._id,
    stem: file.parsed._stem,
    meta: {},
    extension: file.parsed._extension,
    path: pathInCollection,
  }

  const properties = (collection.schema.definitions![collection.name] as JsonSchema7ObjectType).properties

  // Map parsed content to collection schema
  Object.keys(file.parsed).forEach((key) => {
    if (key in properties) {
      mappedFile[key] = file.parsed![key]
    }
    else {
      (mappedFile.meta as Record<string, unknown>)[key] = file.parsed![key]
    }
  })

  return mappedFile
}
