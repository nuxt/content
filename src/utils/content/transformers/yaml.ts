import { parseFrontMatter } from 'remark-mdc'
import type { ParsedContent } from '../../../types/content'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Yaml',
  extensions: ['.yml', '.yaml'],
  parse: (id, content) => {
    const { data } = parseFrontMatter(`---\n${content}\n---`)

    // Keep array contents under `body` key
    let parsed = data
    if (Array.isArray(data)) {
      console.warn(`YAML array is not supported in ${id}, moving the array into the \`body\` key`)
      parsed = { body: data }
    }

    return <ParsedContent> {
      ...parsed,
      body: parsed.body || parsed,
      id,
    }
  },
})
