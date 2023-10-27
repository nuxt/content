import { parseFrontMatter } from 'remark-mdc'
import type { ParsedContent } from '../types'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Yaml',
  extensions: ['.yml', '.yaml'],
  parse: (_id, content) => {
    const { data } = parseFrontMatter(`---\n${content}\n---`)

    // Keep array contents under `body` key
    let parsed = data
    if (Array.isArray(data)) {
      // eslint-disable-next-line no-console
      console.warn(`YAML array is not supported in ${_id}, moving the array into the \`body\` key`)
      parsed = { body: data }
    }

    return <ParsedContent> {
      ...parsed,
      _id,
      _type: 'yaml'
    }
  }
})
