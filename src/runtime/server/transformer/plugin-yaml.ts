import { parseFrontMatter } from '@docus/mdc'
import { defineContentPlugin } from './helpers'

export default defineContentPlugin({
  name: 'Yaml',
  extentions: ['.yml', '.yaml'],
  parse: async (id, content) => {
    const parsed = await parseFrontMatter(`---\n${content}\n---`)

    return {
      meta: {
        id,
        type: 'yaml'
      },
      body: parsed.data
    }
  }
})
