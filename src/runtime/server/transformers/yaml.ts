import { parseFrontMatter } from '../../markdown-parser'

export default {
  name: 'Yaml',
  extentions: ['.yml', '.yaml'],
  parse: async (id, content) => {
    const parsed = await parseFrontMatter(`---\n${content}\n---`)

    return {
      ...parsed.data,
      id,
      type: 'yaml'
    }
  }
}
