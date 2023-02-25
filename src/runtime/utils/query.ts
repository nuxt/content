import { getQuery, H3Event, createError } from 'h3'
import { QueryBuilderParams, QueryBuilderWhere } from '../types'
import { jsonParse, jsonStringify } from './json'

const parseJSONQueryParams = (body: string) => {
  try {
    return jsonParse(body)
  } catch (e) {
    throw createError({ statusCode: 400, message: 'Invalid _params query' })
  }
}

export const encodeQueryParams = (params: QueryBuilderParams) => {
  let encoded = jsonStringify(params)
  encoded = typeof Buffer !== 'undefined' ? Buffer.from(encoded).toString('base64') : btoa(encoded)

  encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  // split to chunks of 100 chars
  const chunks = encoded.match(/.{1,100}/g) || []
  return chunks.join('/')
}

export const decodeQueryParams = (encoded: string) => {
  // remove chunks
  encoded = encoded.replace(/\//g, '')

  // revert base64
  encoded = encoded.replace(/-/g, '+').replace(/_/g, '/')
  encoded = encoded.padEnd(encoded.length + (4 - (encoded.length % 4)) % 4, '=')

  return parseJSONQueryParams(typeof Buffer !== 'undefined' ? Buffer.from(encoded, 'base64').toString() : atob(encoded))
}

const memory: Record<string, QueryBuilderParams> = {}
export const getContentQuery = (event: H3Event): QueryBuilderParams => {
  const { params } = event.context.params || {}
  if (params) {
    return decodeQueryParams(params.replace(/.json$/, ''))
  }

  const qid = event.context.params?.qid?.replace(/.json$/, '')
  const query: any = getQuery(event) || {}

  // Using /api/_content/query/:qid?_params=....
  if (qid && query._params) {
    memory[qid] = parseJSONQueryParams(decodeURIComponent(query._params))

    if (memory[qid].where && !Array.isArray(memory[qid].where)) {
      memory[qid].where = [memory[qid].where as any as QueryBuilderWhere]
    }

    return memory[qid]
  }
  if (qid && memory[qid]) {
    return memory[qid]
  }

  // Using /api/_content/query?_params={{JSON_FORMAT}}
  if (query._params) {
    return parseJSONQueryParams(decodeURIComponent(query._params))
  }

  // Using /api/_content/query?path=...&only=...

  // Support both ?only=path,title and ?only=path&only=title
  if (typeof query.only === 'string' && query.only.includes(',')) {
    query.only = (query.only as string).split(',').map(s => s.trim())
  }
  if (typeof query.without === 'string' && query.without.includes(',')) {
    query.without = (query.without as string).split(',').map(s => s.trim())
  }

  const where = query.where || {}
  // ?partial=true|false&draft=true|false&empty=true|false
  for (const key of ['draft', 'partial', 'empty']) {
    // ?partial=true|false
    if (query[key] && ['true', 'false'].includes(query[key])) {
      where[key] = query[key] === 'true'
      delete query[key]
    }
  }

  // ?sortyBy=size:1
  if (query.sort) {
    query.sort = String(query.sort).split(',').map((s) => {
      const [key, order] = s.split(':')
      return [key, +order]
    })
  }
  // ?[query]=...
  const reservedKeys = ['partial', 'draft', 'only', 'without', 'where', 'sort', 'limit', 'skip']
  for (const key of Object.keys(query)) {
    if (reservedKeys.includes(key)) { continue }
    query.where = query.where || {}
    query.where[key] = query[key]
  }

  if (Object.keys(where).length > 0) {
    query.where = [where]
  } else {
    delete query.where
  }

  return query
}
