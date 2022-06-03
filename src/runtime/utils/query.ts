import { useQuery, CompatibilityEvent, createError } from 'h3'
import { QueryBuilderParams } from '../types'
import { jsonParse } from './json'

const parseQueryParams = (body: string) => {
  try {
    return jsonParse(body)
  } catch (e) {
    throw createError({ statusCode: 400, message: 'Invalid _params query' })
  }
}

const memory = {}
export const getContentQuery = (event: CompatibilityEvent): QueryBuilderParams => {
  const { qid } = event.context.params
  const query: any = useQuery(event) || {}

  // Using /api/_content/query/:qid?_params=....
  if (qid && query._params) {
    memory[qid] = parseQueryParams(query._params)

    return memory[qid]
  }
  if (memory[qid]) {
    return memory[qid]
  }

  // Using /api/_content/query?_params={{JSON_FORMAT}}
  if (query._params) {
    return parseQueryParams(query._params)
  }

  // Using /api/_content/query?path=...&only=...

  // Support both ?only=path,title and ?only=path&only=title
  if (typeof query.only === 'string' && query.only.includes(',')) {
    query.only = query.only.split(',').map(s => s.trim())
  }
  if (typeof query.without === 'string' && query.without.includes(',')) {
    query.without = query.without.split(',').map(s => s.trim())
  }

  query.where = query.where || {}
  // ?partial=true|false&draft=true|false&empty=true|false
  for (const key of ['draft', 'partial', 'empty']) {
    // ?partial=true|false
    if (query[key] && ['true', 'false'].includes(query[key])) {
      query.where[key] = query[key] === 'true'
      delete query[key]
    }
  }
  // ?sortyBy=size:1
  if (query.sort) {
    query.sort = query.sort.split(',').map((s) => {
      const [key, order] = s.split(':')
      return [key, +order]
    })
  }
  // ?[query]=...
  const reservedKeys = ['partial', 'draft', 'only', 'without', 'where', 'sort', 'limit', 'skip']
  for (const key of Object.keys(query)) {
    if (reservedKeys.includes(key)) { continue }

    query.where[key] = query[key]
  }

  return query
}
