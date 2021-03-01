const handlers = require('mdast-util-to-hast/lib/handlers')
const all = require('mdast-util-to-hast/lib/all')
const htmlTags = require('html-tags')
const { paramCase } = require('change-case')
const { getTagName } = require('./utils')

function paragraph (h, node) {
  if (node.children && node.children[0] && node.children[0].type === 'html') {
    const tagName = paramCase(getTagName(node.children[0].value))
    // Unwrap if component
    if (!htmlTags.includes(tagName)) {
      return all(h, node)
    }
  }
  return handlers.paragraph(h, node)
}

module.exports = paragraph
