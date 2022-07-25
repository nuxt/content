import { ParsedContent } from '../types'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'csv',
  extensions: ['.csv'],
  parse: async (_id, content, options = {}) => {
    const csvToJson: any = await import('csvtojson').then(m => m.default || m)

    const parsed = await csvToJson({ output: 'json', ...options })
      .fromString(content)

    return <ParsedContent> {
      _id,
      _type: 'csv',
      body: parsed
    }
  }
})
