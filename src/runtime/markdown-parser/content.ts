import type { Processor } from 'unified'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { MarkdownOptions, MarkdownRoot } from '../types'
import remarkMDC from './remark-mdc'
import handlers from './handler'
import compiler from './compiler'
import { flattenNodeText } from './utils/ast'

const usePlugins = (plugins: any[], stream: Processor) =>
  plugins.reduce((stream, plugin) => stream.use(plugin[0] || plugin, plugin[1] || undefined), stream)

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
export async function generateBody (content: string, options: MarkdownOptions & { data: any }): Promise<MarkdownRoot> {
  const { highlighter, data } = options
  const rehypeOptions: any = {
    handlers: await handlers(highlighter),
    allowDangerousHtml: true
  }

  return new Promise((resolve, reject) => {
    const stream = unified().use(remarkParse)

    if (options.mdc) {
      stream.use(remarkMDC, { components: options.components })
    }

    usePlugins(options.remarkPlugins, stream)
    stream.use(remark2rehype, rehypeOptions)
    usePlugins(options.rehypePlugins, stream)

    stream.use(compiler, options as any)
    stream.process(
      {
        value: content,
        data
      },
      (error, file) => {
        if (error) {
          return reject(error)
        }
        Object.assign(data, file?.data || {})

        resolve(file?.result as MarkdownRoot)
      }
    )
  })
}
