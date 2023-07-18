import { parse } from '../markdown-parser'
import type { MarkdownOptions, MarkdownPlugin } from '../types'
import { MarkdownParsedContent } from '../types'
import { defineTransformer } from './utils'

export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (_id, content, options = {}) => {
    const config = { ...options } as MarkdownOptions
    config.rehypePlugins = await importPlugins(config.rehypePlugins)
    config.remarkPlugins = await importPlugins(config.remarkPlugins)

    const parsed = await parse(content as string, config)

    return <MarkdownParsedContent> {
      ...parsed.meta,
      body: parsed.body,
      _type: 'markdown',
      _id
    }
  }
})

async function importPlugins (plugins: Record<string, false | MarkdownPlugin> = {}) {
  const resolvedPlugins: Record<string, false | MarkdownPlugin & { instance: any }> = {}
  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin) {
      resolvedPlugins[name] = {
        instance: plugin.instance || await import(/* @vite-ignore */ name).then(m => m.default || m),
        options: plugin
      }
    } else {
      resolvedPlugins[name] = false
    }
  }
  return resolvedPlugins
}
