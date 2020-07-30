const handlers = require('mdast-util-to-hast/lib/handlers')
const { paramCase } = require('change-case')
const { getTagName } = require('./utils')

function html (h, node) {
  const tagName = getTagName(node.value)
  // transform to kebab-case (useful for PascalCase vue components)
  if (tagName) {
    node.value = node.value.replace(tagName, paramCase(tagName))
  }

  return handlers.html(h, node)
}

module.exports = html
