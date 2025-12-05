import { destr } from 'destr'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Json',
  extensions: ['.json'],
  parse: async (file) => {
    const { id, body } = file
    let parsed: Record<string, unknown>

    if (typeof body === 'string') {
      parsed = destr(body)
    }
    else {
      parsed = body
    }

    // Keep array contents under `body` key
    if (Array.isArray(parsed)) {
      console.warn(`JSON array is not supported in ${id}, moving the array into the \`body\` key`)
      parsed = {
        body: parsed,
      }
    }

    return {
      ...parsed,
      id,
    }
  },
})
