import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { getContentQuery } = await import('../../utils/query')
  const { serverQueryContent } = await import('../storage')

  const query = getContentQuery(event)
  const { advanceQuery } = useRuntimeConfig().public.content.experimental

  if (query.first) {
    let contentQuery = serverQueryContent(event, query)

    if (!advanceQuery) {
      contentQuery = contentQuery.withDirConfig()
    }

    const content = await contentQuery.findOne()

    const _result = advanceQuery ? content?.result : content
    const missing = !_result && !content?.dirConfig?.navigation?.redirect && !content?._dir?.navigation?.redirect
    // If no documents matchs and using findOne()
    if (missing) {
      throw createError({
        statusMessage: 'Document not found!',
        statusCode: 404,
        data: {
          description: 'Could not find document for the given query.',
          query
        }
      })
    }

    return content
  }

  if (query.count) {
    return serverQueryContent(event, query).count()
  }

  return serverQueryContent(event, query).find()
})
