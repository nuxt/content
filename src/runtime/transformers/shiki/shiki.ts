import { visit } from 'unist-util-visit'
import { defineTransformer } from '../utils'
import { useShikiHighlighter } from './highlighter'
import type { TokenColorMap, MarkdownNode } from './types'

export default defineTransformer({
  name: 'highlight',
  extensions: ['.md'],
  transform: async (content, options = {}) => {
    const shikiHighlighter = useShikiHighlighter(options)
    const colorMap: TokenColorMap = {}
    const codeBlocks: any[] = []
    const inlineCodes: any = []
    visit(
      content.body,
      (node: any) => (node.tag === 'code' && node?.props.code) || (node.tag === 'code-inline' && (node.props?.lang || node.props?.language)),
      (node) => {
        if (node.tag === 'code') {
          codeBlocks.push(node)
        } else if (node.tag === 'code-inline') {
          inlineCodes.push(node)
        }
      }
    )

    await Promise.all(codeBlocks.map(highlightBlock))
    await Promise.all(inlineCodes.map(highlightInline))

    // Inject token colors at the end of the document
    if (Object.values(colorMap).length) {
      content.body.children.push({
        type: 'element',
        tag: 'style',
        children: [{ type: 'text', value: shikiHighlighter.generateStyles(colorMap) }]
      })
    }

    return content

    /**
     * Highlight inline code
     */
    async function highlightInline (node: MarkdownNode) {
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
    async function highlightBlock (node: MarkdownNode) {
      const { code, language: lang, highlights = [] } = node.props!

      const innerCodeNode = node.children![0].children![0]
      innerCodeNode.children = await shikiHighlighter.getHighlightedAST(code, lang, options.theme, { colorMap, highlights })

      return node
    }
  }
})
