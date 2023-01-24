import { visit } from 'unist-util-visit'
import type { MarkdownRoot } from '../../types'
import { defineTransformer } from '../utils'
import { useShikiHighlighter } from './highlighter'
import type { TokenColorMap, MarkdownNode } from './types'

export default defineTransformer({
  name: 'highlight',
  extensions: ['.md'],
  transform: async (content, options = {}) => {
    const shikiHighlighter = useShikiHighlighter(options)

    await Promise.all([
      highlight(content.body),
      highlight(content.excerpt)
    ])

    return content

    /**
     * Highlight document with code nodes
     * @param document tree
     */
    async function highlight (document: MarkdownRoot) {
      if (!document) {
        return
      }
      const colorMap: TokenColorMap = {}
      const codeBlocks: any[] = []
      const inlineCodes: any = []
      visit(
        document,
        (node: any) => (node?.tag === 'code' && node?.props.code) || (node?.tag === 'code-inline' && (node.props?.lang || node.props?.language)),
        (node: MarkdownNode) => {
          if (node?.tag === 'code') {
            codeBlocks.push(node)
          } else if (node?.tag === 'code-inline') {
            inlineCodes.push(node)
          }
        }
      )

      await Promise.all(codeBlocks.map((node: MarkdownNode) => highlightBlock(node, colorMap)))
      await Promise.all(inlineCodes.map((node: MarkdownNode) => highlightInline(node, colorMap)))

      // Inject token colors at the end of the document
      if (Object.values(colorMap).length) {
        document?.children.push({
          type: 'element',
          tag: 'style',
          children: [{ type: 'text', value: shikiHighlighter.generateStyles(colorMap) }]
        })
      }
    }

    /**
     * Highlight inline code
     */
    async function highlightInline (node: MarkdownNode, colorMap: TokenColorMap) {
      const code = node.children![0].value!

      // Fetch highlighted tokens
      const lines = await shikiHighlighter.getHighlightedAST(code, node.props!.lang || node.props!.language, options.theme, { colorMap })

      // Generate highlighted children
      node.children = lines[0].children
      node.props = Object.assign(node.props || {}, { class: 'colored' })

      return node
    }

    /**
     * Highlight a code block
     */
    async function highlightBlock (node: MarkdownNode, colorMap: TokenColorMap) {
      const { code, language: lang, highlights = [] } = node.props!

      const innerCodeNode = node.children![0].children![0]
      innerCodeNode.children = await shikiHighlighter.getHighlightedAST(code, lang, options.theme, { colorMap, highlights })

      return node
    }
  }
})
