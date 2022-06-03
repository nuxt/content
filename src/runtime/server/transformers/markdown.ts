import { parse } from '../../markdown-parser'
import type { MarkdownOptions } from '../../types'
import { MarkdownParsedContent } from '../../types'
import { useRuntimeConfig } from '#imports'

const importPlugin = async (p: [string, any]) => ([
  await import(p[0]).then(res => res.default || res),
  typeof p[1] === 'object' ? { ...p[1] } : p[1]
])

export default {
  name: 'markdown',
  extensions: ['.md'],
  parse: async (_id, content) => {
    const config: MarkdownOptions = { ...useRuntimeConfig().content?.markdown || {} }
    config.rehypePlugins = await Promise.all((config.rehypePlugins || []).map(importPlugin))
    config.remarkPlugins = await Promise.all((config.remarkPlugins || []).map(importPlugin))

    const parsed = await parse(content, config)

    return <MarkdownParsedContent> {
      ...parsed.meta,
      body: parsed.body,
      _type: 'markdown',
      _id
    }
  }
}
