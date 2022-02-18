import { defineContentPlugin } from '../..'
import { parse } from '../../markdown-parser'
import { MarkdownOptions } from '../../types'
import { privateConfig } from '#config'

const importPlugin = async (p: [string, any]) => [await import(p[0]).then(res => res.default || res), p[1]]
export default defineContentPlugin({
  name: 'markdown',
  extentions: ['.md'],
  parse: async (id, content) => {
    const config: MarkdownOptions = { ...privateConfig.content?.markdown || {} }
    config.rehypePlugins = await Promise.all((config.rehypePlugins || []).map(importPlugin))
    config.remarkPlugins = await Promise.all((config.remarkPlugins || []).map(importPlugin))

    const parsed = await parse(content, config)

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
