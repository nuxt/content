import { parse } from '../../markdown-parser'
import type { MarkdownOptions } from '../../types'
import { useRuntimeConfig } from '#nitro'

const importPlugin = async (p: [string, any]) => [await import(p[0]).then(res => res.default || res), p[1]]

export default {
  name: 'markdown',
  extentions: ['.md'],
  parse: async (id, content) => {
    const config: MarkdownOptions = { ...useRuntimeConfig().content?.markdown || {} }
    config.rehypePlugins = await Promise.all((config.rehypePlugins || []).map(importPlugin))
    config.remarkPlugins = await Promise.all((config.remarkPlugins || []).map(importPlugin))

    const parsed = await parse(content, config)

    return {
      ...parsed.meta,
      body: parsed.body,
      type: 'markdown',
      id
    }
  }
}
