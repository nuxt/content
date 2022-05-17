import { parseFrontMatter } from '../../markdown-parser'

export default {
  name: 'Yaml',
  extentions: ['.yml', '.yaml'],
  parse: async (id, content) => {
    const { data } = await parseFrontMatter(`---\n${content}\n---`)

    // Keep array contents under `body` key
    const parsed = Array.isArray(data) ? { body: data } : data

    return {
      ...parsed,
      id,
      type: 'yaml'
    }
  }
}
