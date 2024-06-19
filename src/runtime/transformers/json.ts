import { destr } from 'destr'
import type { ParsedContent } from '@nuxt/content'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Json',
  extensions: ['.json', '.json5'],
  parse: async (_id, content) => {
    let parsed

    if (typeof content === 'string') {
      if (_id.endsWith('json5')) {
        parsed = (await import('json5').then(m => m.default || m))
          .parse(content)
      } else if (_id.endsWith('json')) {
        parsed = destr(content)
      }
    } else {
      parsed = content
    }

    // Keep array contents under `body` key
    if (Array.isArray(parsed)) {
       
      console.warn(`JSON array is not supported in ${_id}, moving the array into the \`body\` key`)
      parsed = {
        body: parsed
      }
    }

    return <ParsedContent> {
      ...parsed,
      _id,
      _type: 'json'
    }
  }
})
