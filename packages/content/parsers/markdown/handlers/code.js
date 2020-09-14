const Prism = require('prismjs')
const detab = require('detab')
const u = require('unist-builder')
const escapeHtml = require('escape-html')
const { parseThematicBlock } = require('./utils')

require('prismjs/components/index')()

const prismHighlighter = (rawCode, language, { lineHighlights, fileName }, { h, node }) => {
  let lang = language === 'vue' ? 'html' : language

  // eslint-disable-next-line no-prototype-builtins
  const hasPrismHightlight = Prism.languages.hasOwnProperty(lang)

  let code = hasPrismHightlight
    ? Prism.highlight(rawCode, Prism.languages[lang], lang)
    : rawCode

  if (!lang || !hasPrismHightlight) {
    lang = 'text'
    code = escapeHtml(code)
  }

  const props = {
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
  childs.push(h(node, 'pre', props, [
    h(node, 'code', [u('raw', code)])
  ]))

  return h(node.position, 'div', { className: ['nuxt-content-highlight'] }, childs)
}

const toAst = (h, node) => (highlighted) => {
  if (typeof highlighted === 'string') {
    return h(node, 'div', { className: ['nuxt-content-highlight'] }, [u('raw', highlighted)])
  }
  return highlighted
}

module.exports = highlighter => (h, node) => {
  const { language, lineHighlights, fileName } = parseThematicBlock(node.lang)
  const code = node.value ? detab(node.value + '\n') : ''

  if (!highlighter) {
    return prismHighlighter(code, language, { lineHighlights, fileName }, { h, node })
  }

  const highlightedCode = highlighter(code, language, { lineHighlights, fileName }, { h, node, u })
  return toAst(h, node)(highlightedCode)
}
