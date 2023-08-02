import { createError, defineEventHandler } from 'h3'
import { join } from 'pathe'
import { serverQueryContent } from '../storage'
import { getContentQuery } from '../../utils/query'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const query = getContentQuery(event)
  const { advanceQuery } = useRuntimeConfig().public.content.experimental

  if (query.first) {
    const content = await serverQueryContent(event, query).findOne()

    const _path = advanceQuery ? content?.result?._path : content?._path

    // Try to find `_dir` file before throwing 404
    const path = _path || query.where?.find(w => w._path)?._path as string
    if (path) {
      const _dir = await serverQueryContent(event)
        .where({ _path: join(path, '_dir') })
        .without('_')
        .findOne()
        .then(res => advanceQuery ? res.result : res)
      if (_dir && !Array.isArray(_dir)) {
        return {
          _path: path,
          ...(content || {}),
          _dir: _dir?.result || _dir
        }
      }
    }

    const missing = advanceQuery ? !content?.result : !content
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
