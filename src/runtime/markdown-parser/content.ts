import type { Processor } from 'unified'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import remarkMDC from 'remark-mdc'
import { MarkdownOptions, MarkdownPlugin, MarkdownRoot } from '../types'
import handlers from './handler'
import compiler from './compiler'
import { flattenNodeText } from './utils/ast'
import { nodeTextContent } from './utils/node'

const usePlugins = (plugins: Record<string, false | MarkdownPlugin>, stream: Processor) => {
  for (const plugin of Object.values(plugins)) {
    if (plugin) {
      const { instance, options, ...deprecatedOptions } = plugin
      if (Object.keys(deprecatedOptions).length) {
        console.warn('[Markdown] Deprecated syntax. Please use `options` key in order to pass option to remark/rehype plugins.')
      }
      stream.use(instance, options || deprecatedOptions)
    }
  }
}

/**
 * Generate text excerpt summary
 * @param {string} excerptContent - JSON AST generated from excerpt markdown.
 * @returns {string} concatinated excerpt
 */
export function generateDescription (excerptContent: MarkdownRoot) {
  return flattenNodeText(excerptContent)
}

/**
 * Generate json body
 * @param {string} content - file content
 * @param {object} data - document data
 * @returns {object} JSON AST body
 */
export function generateBody (content: string, options: MarkdownOptions & { data: any }): Promise<MarkdownRoot> {
  const rehypeOptions: any = {
    handlers,
    allowDangerousHtml: true
  }

  return new Promise((resolve, reject) => {
    const stream = unified().use(remarkParse)

    if (options.mdc) {
      stream.use(remarkMDC)
    }

    usePlugins(options.remarkPlugins, stream)
    stream.use(remark2rehype, rehypeOptions)
    usePlugins(options.rehypePlugins, stream)

    stream.use(compiler, options as any)
    stream.process(
      {
        value: content,
        data: options.data
      },
      (error, file) => {
        if (error) {
          return reject(error)
        }
        Object.assign(options.data, file?.data || {})

        resolve(file?.result as MarkdownRoot)
      }
    )
  })
}

export function contentHeading (body: MarkdownRoot) {
  let title = ''
  let description = ''
  const children = body.children
    // top level `text` and `hr` can be ignored
    .filter(node => node.type !== 'text' && node.tag !== 'hr')

  if (children.length && children[0].tag === 'h1') {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Generate title
     */
    title = nodeTextContent(node)
  }

  if (children.length && children[0].tag === 'p') {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Generate description
     */
    description = nodeTextContent(node)
  }

  return {
    title,
    description
  }
}
