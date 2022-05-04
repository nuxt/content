import { createError, defineEventHandler, useQuery } from 'h3'
import type { QueryBuilderParams } from '../../types'
import { queryContent, useApiQuery } from '../storage'

export default defineEventHandler(async (event) => {
  const { query: qid } = event.context.params
  const query: Partial<QueryBuilderParams> = useApiQuery(qid, useQuery(event)?.params || undefined)

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
