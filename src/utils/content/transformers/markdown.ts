import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { type State } from 'mdast-util-to-hast'
import { normalizeUri } from 'micromark-util-sanitize-uri'
import { type Properties, type Element } from 'hast'
import { type Link } from 'mdast'
import { isRelative } from 'ufo'
import type { MarkdownOptions, MarkdownPlugin } from '../../../types/content'
import { defineTransformer } from './utils'
import { generatePath } from './path-meta'

export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (id, content, options: Partial<MarkdownOptions> = {}) => {
    const config = { ...options } as MarkdownOptions
    config.rehypePlugins = await importPlugins(config.rehypePlugins)
    config.remarkPlugins = await importPlugins(config.remarkPlugins)

    const highlight = options.highlight
      ? {
          ...options.highlight,
          // Pass only when it's an function. String values are handled by `@nuxtjs/mdc`
          highlighter: typeof options.highlight?.highlighter === 'function'
            ? options.highlight.highlighter
            : undefined,
        }
      : undefined

    const parsed = await parseMarkdown(content as string, {
      ...config,
      highlight,
      toc: config.toc,
      remark: { plugins: config.remarkPlugins },
      rehype: {
        plugins: config.rehypePlugins,
        options: { handlers: { link } },
      },
    })

    return {
      ...parsed.data,
      excerpt: parsed.excerpt,
      body: {
        ...parsed.body,
        toc: parsed.toc,
      },
      id,
    }
  },
})

async function importPlugins(plugins: Record<string, false | MarkdownPlugin> = {}) {
  const resolvedPlugins: Record<string, false | MarkdownPlugin> = {}
  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin) {
      resolvedPlugins[name] = {
        instance: plugin.instance || await import(/* @vite-ignore */ name).then(m => m.default || m),
        options: plugin,
      }
    }
    else {
      resolvedPlugins[name] = false
    }
  }
  return resolvedPlugins
}

function link(state: State, node: Link & { attributes?: Properties }) {
  const properties: Properties = {
    ...((node.attributes || {})),
    href: normalizeUri(normalizeLink(node.url)),
  }

  if (node.title !== null && node.title !== undefined) {
    properties.title = node.title
  }

  const result: Element = {
    type: 'element',
    tagName: 'a',
    properties,
    children: state.all(node),
  }
  state.patch(node, result)
  return state.applyData(node, result)
}

function normalizeLink(link: string) {
  const match = link.match(/#.+$/)
  const hash = match ? match[0] : ''
  if (link.replace(/#.+$/, '').endsWith('.md') && (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/')))) {
    return (generatePath(link.replace('.md' + hash, ''), { forceLeadingSlash: false }) + hash)
  }
  else {
    return link
  }
}
