import { destr } from 'destr'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Json',
  extensions: ['.json'],
  parse: async (id, content) => {
    let parsed

    if (typeof content === 'string') {
      parsed = destr(content)
    }
    else {
      parsed = content
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
      body: parsed.body || parsed,
      id,
    }
  },
})
