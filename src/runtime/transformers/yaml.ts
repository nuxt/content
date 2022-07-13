import { parseFrontMatter } from 'remark-mdc'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'Yaml',
  extensions: ['.yml', '.yaml'],
  parse: async (_id, content) => {
    const { data } = await parseFrontMatter(`---\n${content}\n---`)

    // Keep array contents under `body` key
    let parsed = data
    if (Array.isArray(data)) {
      // eslint-disable-next-line no-console
      console.warn(`YAML array is not supported in ${_id}, moving the array into the \`body\` key`)
      parsed = { body: data }
    }

    return {
      ...parsed,
      _id,
      _type: 'yaml'
    }
  }
})
