import { defineHandle, isMethod, assertMethod, useBody, useQuery, createError } from 'h3'
import { queryContent } from '../storage'
import type { QueryBuilderParams } from '../../types'

export default defineHandle(async (req) => {
  assertMethod(req, ['GET', 'POST'])

  const params = useQuery(req)
  const body = isMethod(req, 'POST') ? await useBody<Partial<QueryBuilderParams>>(req) : {}
  const query = {
    ...params,
    ...body
  }
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
