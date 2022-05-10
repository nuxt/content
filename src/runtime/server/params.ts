import { useQuery, CompatibilityEvent, createError } from 'h3'
import { jsonParse } from '../utils/json'

const memory = {}
export const useApiParams = (event: CompatibilityEvent) => {
  const { query: qid } = event.context.params
  const params = useQuery(event)?.params || undefined

  if (params) {
    try {
      memory[qid] = typeof params === 'string' ? jsonParse(params) : params
    } catch (e) {
      throw createError({ statusCode: 400, message: 'Invalid query params' })
    }
  }

  return memory[qid] || {}
}
