import { eventHandler, getRouterParam } from 'h3'
import { queryContents } from '../../utils/queryContents'
import { createNav } from '../../navigation'
import { collections } from '#content-v3/collections'

export default eventHandler(async (event) => {
  const collectionName = getRouterParam(event, 'collection')
  const collection = collections.find(c => c.name === collectionName)

  if (!collection) {
    return {
      statusCode: 404,
      body: {
        message: `Collection ${collectionName} not found`,
      },
    }
  }

  const contents = await queryContents(collection.name)
    .select('stem', 'path', 'path')
    .all()

  return createNav(contents, {})
})
