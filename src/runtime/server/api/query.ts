import { createError, defineEventHandler } from 'h3'
import { join } from 'pathe'
import { serverQueryContent } from '../storage'
import { getContentQuery } from '../../utils/query'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)
  const contents = await serverQueryContent(event, query).find()

  if (query.first) {
    const path = contents?._path || query.where.find(w => w._path)?._path
    if (path) {
      const _dir = await serverQueryContent(event).where({ _path: join(path, '_dir') }).without('_').findOne()
      if (!Array.isArray(_dir)) {
        return {
          _path: path,
          ...contents,
          _dir
        }
      }
    }
  }

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
