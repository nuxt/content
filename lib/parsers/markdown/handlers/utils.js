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
      lang: null,
      lineHighlights: null,
      fileName: null
    }
  }

  const language = lang.match(/^[^ \t]+(?=[ \t]|$)/)
  const lineHighlightTokens = lang.split('{')
  const filenameTokens = lang.split('[')

  return {
    lang: language ? language[0] : null,
    lineHighlights: lineHighlightTokens[1] ? lineHighlightTokens[1].replace('}', '') : null,
    fileName: filenameTokens[1] ? filenameTokens[1].replace(']', '') : null
  }
}
