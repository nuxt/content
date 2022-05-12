import { useQuery, CompatibilityEvent, createError } from 'h3'
import { jsonParse } from './json'

const parseQueryParams = (body: string) => {
  try {
    return jsonParse(body)
  } catch (e) {
    throw createError({ statusCode: 400, message: 'Invalid _params query' })
  }
}

const memory = {}
export const getContentQuery = (event: CompatibilityEvent) => {
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

  // Using /api/_content/query?slug=...

  // Support both ?only=slug,title and ?only=slug&only=title
  if (typeof query.only === 'string' && query.only.includes(',')) {
    query.only = query.only.split(',').map(s => s.trim())
  }

  return query
}
