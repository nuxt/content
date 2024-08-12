import { eventHandler, getRouterParam, createError } from 'h3'
import { createNav } from '../../navigation'
import { collections } from '#content-v3/collections'
import type { CollectionInfo } from '~/src/types'
import { queryContents } from '#imports'

export default eventHandler(async (event) => {
  const collectionName = getRouterParam(event, 'collection')
  const collection = collections.find((c: CollectionInfo) => c.name === collectionName)

  if (!collection) {
    throw createError({
      statusCode: 404,
      message: `Collection ${collectionName} not found`,
    })
  }

  const contents = await queryContents(collection.name)
    .select('stem', 'path', 'title')
    .all()

  return createNav(contents, {})
})
