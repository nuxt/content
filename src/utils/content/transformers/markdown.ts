import type { State } from 'mdast-util-to-hast'
import { normalizeUri } from 'micromark-util-sanitize-uri'
import type { Properties, Element } from 'hast'
import type { Link } from 'mdast'
import { isRelative } from 'ufo'
import type { MarkdownOptions, MarkdownPlugin } from '../../../types/content'
import { defineTransformer } from './utils'
import { generatePath } from './path-meta'
import { parseAsync } from 'mdc-syntax'

export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (file, options: Partial<MarkdownOptions> = {}) => {
    const highlightOptions = (options.highlight as unknown as boolean | undefined) === false ? undefined : {
      themes: {
        light: (options.highlight?.theme as unknown as Record<string, string>)?.default || (options.highlight?.theme as unknown as Record<string, string>)?.light || 'material-theme-lighter',
        dark: (options.highlight?.theme as unknown as Record<string, string>)?.dark || 'material-theme-palenight',
      }
    }

    const parsed = await parseAsync(file.body as string, {
      highlight: highlightOptions
    })


    return {
      ...parsed.data,
      excerpt: parsed.excerpt,
      body: {
        ...parsed.body,
        toc: parsed.toc,
      },
      id: file.id,
      title: parsed.data?.title || undefined,
    }
  },
})

function link(state: State, node: Link & { attributes?: Properties }) {
  const properties: Properties = {
    ...((node.attributes || {})),
    href: normalizeUri(normaliseLink(node.url)),
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

function normaliseLink(link: string) {
  const match = link.match(/#.+$/)
  const hash = match ? match[0] : ''
  if (link.replace(/#.+$/, '').endsWith('.md') && (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/')))) {
    return (generatePath(link.replace('.md' + hash, ''), { forceLeadingSlash: false }) + hash)
  }
  else {
    return link
  }
}
