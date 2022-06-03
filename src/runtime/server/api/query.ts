import { createError, defineEventHandler } from 'h3'
import { serverQueryContent } from '../storage'
import { getContentQuery } from '../../utils/query'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)
  const contents = await serverQueryContent(event, query).find()

  // If no documents matchs and using findOne()
  if (query.first && Array.isArray(contents) && contents.length === 0) {
    throw createError({
      statusMessage: 'Document not found!',
      statusCode: 404,
      data: {
        description: 'Could not find document for the given query.',
        query
      }
    })
  }

  return contents
})
