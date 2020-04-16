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

  const tokens = lang.split('{')
  const language = tokens[0].match(/^[^ \t]+(?=[ \t]|$)/)

  return {
    lang: language ? tokens[0].match(/^[^ \t]+(?=[ \t]|$)/) : null,
    lineHighlights: tokens[1] ? tokens[1].replace('}', '') : null,
    fileName: tokens[2] ? tokens[2].replace('}', '') : null
  }
}
