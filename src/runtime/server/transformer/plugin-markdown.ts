import { defineContentPlugin } from '../..'
import { parse } from '../../markdown-parser'
import { privateConfig } from '#config'

export default defineContentPlugin({
  name: 'markdown',
  extentions: ['.md'],
  parse: async (id, content) => {
    const parsed = await parse(content, privateConfig.content)

    return {
      meta: {
        id,
        type: 'markdown',
        ...parsed.meta
      },
      body: parsed.body
    }
  }
})
