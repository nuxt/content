import { createError, defineEventHandler } from 'h3'
import type { QueryBuilderParams } from '../../types'
import { queryContent } from '../storage'
import { useApiParams } from '../params'

export default defineEventHandler(async (event) => {
  const query: Partial<QueryBuilderParams> = useApiParams(event)

  const contents = await queryContent(query).find()

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
