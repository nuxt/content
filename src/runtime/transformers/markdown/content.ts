import type { Processor } from 'unified'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { DocusRootNode } from '../../../types'
import handlers from './handler'
import compiler from './compiler'
import { flattenNodeText } from './utils'

const usePlugins = (plugins: any[], stream: Processor) =>
  plugins.reduce((stream, plugin) => stream.use(plugin.instance, plugin.options), stream)

/**
 * Generate text excerpt summary
 * @param {string} excerptContent - JSON AST generated from excerpt markdown.
 * @returns {string} concatinated excerpt
 */
export function generateDescription(excerptContent: DocusRootNode) {
  return flattenNodeText(excerptContent)
}

/**
 * Generate json body
 * @param {string} content - file content
 * @param {object} data - document data
 * @returns {object} JSON AST body
 */
export async function generateBody(content: string, options: any): Promise<DocusRootNode> {
  const { highlighter, data } = options
  const rehypeOptions: any = {
    handlers: await handlers(highlighter),
    allowDangerousHtml: true
  }

  return new Promise((resolve, reject) => {
    let stream = unified().use(remarkParse)

    stream = usePlugins(options.remarkPlugins, stream)
    stream = stream.use(remark2rehype, rehypeOptions)
    stream = usePlugins(options.rehypePlugins, stream)

    stream
      .use(compiler)
      .data(data)
      .process(content, (error, file) => {
        /* istanbul ignore if */
        if (error) {
          return reject(error)
        }
        Object.assign(data, file?.data || {})

        resolve(file?.result as DocusRootNode)
      })
  })
}
