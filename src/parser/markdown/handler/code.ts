import Prism from 'prismjs'
import { detab } from 'detab'
import { u } from 'unist-builder'
import escapeHtml from 'escape-html'
import prismComponents from 'prismjs/components/index'
import { parseThematicBlock } from './utils'

prismComponents()

const DIFF_HIGHLIGHT_SYNTAX = /^(diff)-([\w-]+)/i

const prismHighlighter = (rawCode, language, { lineHighlights, fileName }, { h, node }) => {
  let lang = language || ''
  let grammer

  const diffLanguage = lang.match(DIFF_HIGHLIGHT_SYNTAX)
  if (diffLanguage) {
    lang = diffLanguage[2]
    grammer = Prism.languages.diff
  }

  lang = lang === 'vue' ? 'html' : lang

  if (!grammer) {
    grammer = Prism.languages[lang]
  }

  const highlightLanguage = diffLanguage ? `diff-${lang}` : lang

  let code = grammer ? Prism.highlight(rawCode, grammer, highlightLanguage) : rawCode

  if (!lang || !grammer) {
    lang = 'text'
    code = escapeHtml(code)
  }

  const props: any = {
    className: [`language-${lang}`, 'line-numbers']
  }

  if (lineHighlights) {
    props.dataLine = lineHighlights
  }

  const childs = []

  /**
   * If filename, then set span as a first child
   */
  if (fileName) {
    childs.push(h(node, 'span', { className: ['filename'] }, [u('text', fileName)]))
  }

  /**
   * Set pre as a child
   */
  childs.push(h(node, 'pre', props, [h(node, 'code', [u('raw', code)])]))

  return h(node.position, 'prose-code', {}, childs)
}

const toAst = (h, node) => highlighted => {
  if (typeof highlighted === 'string') {
    return h(node, 'prose-code', {}, [u('raw', highlighted)])
  }
  return highlighted
}

export default highlighter => (h, node) => {
  const lang = node.lang + ' ' + (node.meta || '')
  const { language, lineHighlights, fileName } = parseThematicBlock(lang)
  const code = node.value ? detab(node.value + '\n') : ''

  if (!highlighter) {
    return prismHighlighter(code, language, { lineHighlights, fileName }, { h, node })
  }

  const highlightedCode = highlighter(code, language, { lineHighlights, fileName }, { h, node, u })
  return toAst(h, node)(highlightedCode)
}
