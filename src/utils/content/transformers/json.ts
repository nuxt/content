import { destr } from 'destr'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Json',
  extensions: ['.json', '.json5'],
  parse: async (id, content) => {
    let parsed

    if (typeof content === 'string') {
      if (id.endsWith('json5')) {
        parsed = (await import('json5').then(m => m.default || m))
          .parse(content)
      }
      else if (id.endsWith('json')) {
        parsed = destr(content)
      }
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
