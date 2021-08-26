import { u } from 'unist-builder'

/**
 * Parses the value defined next to 3 back ticks
 * in a codeblock and set line-highlights or
 * filename from it
 *
 * @param {String} lang
 */
export function parseThematicBlock(lang: string) {
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
export function getTagName(value: string) {
  const result = String(value).match(TAG_NAME_REGEXP)

  return result && result[1]
}

// mdast-util-to-hast/lib/wrap.js
/**
 * Wrap `nodes` with line feeds between each entry.
 * Optionally adds line feeds at the start and end.
 *
 * @param {Array.<Content>} nodes
 * @param {boolean} [loose=false]
 * @returns {Array.<Content>}
 */
export function wrap(nodes: any[], loose: boolean = false) {
  /** @type {Array.<Content>} */
  const result = []
  let index = -1

  if (loose) {
    result.push(u('text', '\n'))
  }

  while (++index < nodes.length) {
    if (index) result.push(u('text', '\n'))
    result.push(nodes[index])
  }

  if (loose && nodes.length > 0) {
    result.push(u('text', '\n'))
  }

  return result
}
