import { createError, defineEventHandler } from 'h3'
import { join } from 'pathe'
import { serverQueryContent } from '../storage'
import { getContentQuery } from '../../utils/query'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)

  if (query.first) {
    const content = await serverQueryContent(event, query).findOne()

    // Try to find `_dir` file before throwing 404
    const path = content?._path || query.where?.find(w => w._path)?._path as string
    if (path) {
      const _dir = await serverQueryContent(event).where({ _path: join(path, '_dir') }).without('_').findOne()
      if (!Array.isArray(_dir)) {
        return {
          _path: path,
          ...(content || {}),
          _dir
        }
      }
    }

    // If no documents matchs and using findOne()
    if (!content) {
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

  const contents = await serverQueryContent(event, query).find()

  return contents
})
