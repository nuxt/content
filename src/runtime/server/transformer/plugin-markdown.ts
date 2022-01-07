import { parse } from '@docus/mdc'
import { defineContentPlugin } from './helpers'

export default defineContentPlugin({
  name: 'mdc',
  extentions: ['.md'],
  parse: async (id, content) => {
    const parsed = await parse(content)

    return {
      meta: {
        id,
        ...parsed.meta
      },
      body: parsed.body
    }
  }
})
