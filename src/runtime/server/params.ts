import { useQuery, CompatibilityEvent } from 'h3'
import { jsonParse } from '../utils/json'

const memory = {}
export const useApiParams = (event: CompatibilityEvent) => {
  const { query: qid } = event.context.params
  const params = useQuery(event)?.params || undefined

  if (params) {
    memory[qid] = typeof params === 'string' ? jsonParse(params) : params
  }

  return memory[qid] || {}
}
