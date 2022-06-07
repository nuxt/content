import { parse } from '../../markdown-parser'
import type { MarkdownOptions, MarkdownPlugin } from '../../types'
import { MarkdownParsedContent } from '../../types'
import { useRuntimeConfig } from '#imports'

export default {
  name: 'markdown',
  extensions: ['.md'],
  parse: async (_id, content) => {
    const config: MarkdownOptions = { ...useRuntimeConfig().content?.markdown || {} }
    config.rehypePlugins = await importPlugins(config.rehypePlugins)
    config.remarkPlugins = await importPlugins(config.remarkPlugins)

    const parsed = await parse(content, config)

    return <MarkdownParsedContent> {
      ...parsed.meta,
      body: parsed.body,
      _type: 'markdown',
      _id
    }
  }
}

async function importPlugins (plugins: Record<string, false | MarkdownPlugin> = {}) {
  const resolvedPlugins = {}
  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin) {
      resolvedPlugins[name] = {
        instance: await import(name),
        ...plugin
      }
    } else {
      resolvedPlugins[name] = false
    }
  }
  return resolvedPlugins
}
