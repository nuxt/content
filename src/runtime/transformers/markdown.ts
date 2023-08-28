import { parseMarkdown } from '@nuxtjs/mdc/dist/runtime'
import { type State } from 'mdast-util-to-hast'
import { normalizeUri } from 'micromark-util-sanitize-uri'
import { type Properties, type Element } from 'hast'
import { type Link } from 'mdast'
import { isRelative } from 'ufo'
import type { MarkdownOptions, MarkdownPlugin, MarkdownParsedContent } from '../types'
import { defineTransformer } from './utils'
import { generatePath } from './path-meta'

export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (_id, content, options = {}) => {
    const config = { ...options } as MarkdownOptions
    config.rehypePlugins = await importPlugins(config.rehypePlugins)
    config.remarkPlugins = await importPlugins(config.remarkPlugins)

    const parsed = await parseMarkdown(content as string, {
      highlight: options.highlight,
      remark: {
        plugins: config.remarkPlugins
      },
      rehype: {
        options: {
          handlers: {
            link: link as any
          }
        },
        plugins: config.rehypePlugins
      },
      toc: config.toc
    })

    return <MarkdownParsedContent> {
      ...parsed.data,
      excerpt: parsed.excerpt,
      body: {
        ...parsed.body,
        toc: parsed.toc
      },
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

function link (state: State, node: Link & { attributes?: Properties }) {
  const properties: Properties = {
    ...((node.attributes || {})),
    href: normalizeUri(normalizeLink(node.url))
  }

  if (node.title !== null && node.title !== undefined) {
    properties.title = node.title
  }

  const result: Element = {
    type: 'element',
    tagName: 'a',
    properties,
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}

function normalizeLink (link: string) {
  const match = link.match(/#.+$/)
  const hash = match ? match[0] : ''
  if (link.replace(/#.+$/, '').endsWith('.md') && (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/')))) {
    return (generatePath(link.replace('.md' + hash, ''), { forceLeadingSlash: false }) + hash)
  } else {
    return link
  }
}
