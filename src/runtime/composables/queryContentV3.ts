import { createMatch } from '../content-v2-support-utils/match'
import { createQuery } from '../content-v2-support-utils/query'
import { executeContentQuery } from '../utils/executeContentQuery'

export function queryContentV3(path?: string) {
  const collections = 'content'
  async function fetcher(qq) {
    const match = createMatch()
    const params = qq.params()
    params.where = params.where || []
    path && params.where.unshift({ path: path })

    // handle multiple where conditions
    const conditions = params.where?.length > 1 ? { $and: params.where } : params.where?.[0]

    const sql = conditions ? `SELECT * FROM ${collections} WHERE ${match('content', conditions)}` : `SELECT * FROM ${collections}`

    const result = await executeContentQuery(collections, sql)

    return params.first ? result[0] : result
  }
  const query = createQuery(fetcher, {})

  return query
}
