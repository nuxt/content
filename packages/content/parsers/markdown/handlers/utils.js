const utils = exports = module.exports = {}

/**
 * Parses the value defined next to 3 back ticks
 * in a codeblock and set line-highlights or
 * filename from it
 *
 * @param {String} lang
 */
utils.parseThematicBlock = function (lang) {
  /**
   * Language property on node is missing
   */
  if (!lang) {
    return {
      language: null,
      lineHighlights: null,
      fileName: null
    }
  }

  const language = lang.replace(/[{|[](.+)/, '').match(/^[^ \t]+(?=[ \t]|$)/)
  const lineHighlightTokens = lang.replace(/[[](.+)/, '').split('{')
  const filenameTokens = lang.match(/\[(.+)\]/)

  return {
    language: language ? language[0] : null,
    lineHighlights: lineHighlightTokens[1] ? lineHighlightTokens[1].replace(/}.*/, '') : null,
    fileName: Array.isArray(filenameTokens) ? filenameTokens[1] : null
  }
}

const TAG_NAME_REGEXP = /^<\/?([A-Za-z0-9-_]+) ?[^>]*>/
utils.getTagName = function (value) {
  const result = String(value).match(TAG_NAME_REGEXP)

  return result && result[1]
}
