import { visit } from 'unist-util-visit'
import { withBase } from 'ufo'
import { useRuntimeConfig } from '#imports'

const highlightConfig = useRuntimeConfig().content.highlight

const withContentBase = (url: string) => {
  return withBase(url, `/api/${useRuntimeConfig().public.content.base}`)
}

export default {
  name: 'markdown',
  extensions: ['.md'],
  transform: async (content) => {
    const tokenColors: Record<string, {colors: any, className: string}> = {}
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
    if (Object.values(tokenColors).length) {
      const colors: string[] = []
      for (const colorClass of Object.values(tokenColors)) {
        Object.entries(colorClass.colors).forEach(([variant, color]) => {
          if (variant === 'default') {
            colors.unshift(`.${colorClass.className}{color:${color}}`)
          } else {
            colors.push(`.${variant} .${colorClass.className}{color: ${color}}`)
          }
        })
      }

      content.body.children.push({
        type: 'element',
        tag: 'style',
        children: [{ type: 'text', value: colors.join('') }]
      })
    }

    return content

    /**
     * Highlight inline code
     */
    async function highlightInline (node) {
      const code = node.children[0].value

      // Fetch highlighted tokens
      const lines = await $fetch<any[]>(withContentBase('highlight'), {
        method: 'POST',
        body: {
          code,
          lang: node.props.lang || node.props.language,
          theme: highlightConfig.theme
        }
      })

      // Generate highlighted children
      node.children = lines[0].map(tokenSpan)

      node.props = node.props || {}
      node.props.class = 'colored'

      return node
    }

    /**
     * Highlight a code block
     */
    async function highlightBlock (node) {
      const { code, language: lang, highlights = [] } = node.props

      // Fetch highlighted tokens
      const lines = await $fetch<any[]>(withContentBase('highlight'), {
        method: 'POST',
        body: {
          code,
          lang,
          theme: highlightConfig.theme
        }
      })

      // Generate highlighted children
      const innerCodeNode = node.children[0].children[0]
      innerCodeNode.children = lines.map((line, lineIndex) => ({
        type: 'element',
        tag: 'span',
        props: { class: ['line', highlights.includes(lineIndex + 1) ? 'highlight' : ''].join(' ').trim() },
        children: line.map(tokenSpan)
      }))
      return node
    }

    function getColorProps (token) {
      if (!token.color) {
        return {}
      }
      if (typeof token.color === 'string') {
        return { style: { color: token.color } }
      }
      const key = Object.values(token.color).join('')
      if (!tokenColors[key]) {
        tokenColors[key] = {
          colors: token.color,
          className: 'ct-' + Math.random().toString(16).substring(2, 8) // hash(key)
        }
      }
      return { class: tokenColors[key].className }
    }

    function tokenSpan (token) {
      return {
        type: 'element',
        tag: 'span',
        props: getColorProps(token),
        children: [{ type: 'text', value: token.content }]
      }
    }
  }
}
