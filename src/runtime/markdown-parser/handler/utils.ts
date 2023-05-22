import { u } from 'unist-builder'

/**
 * Parses the value defined next to 3 back ticks
 * in a codeblock and set line-highlights or
 * filename from it
 */
export function parseThematicBlock (lang: string) {
  /**
   * Language property on node is missing
   */
  if (!lang?.trim()) {
    return {
      language: undefined,
      highlights: undefined,
      fileName: undefined,
      meta: undefined
    }
  }

  const language = lang.replace(/[{|[](.+)/, '').match(/^[^ \t]+(?=[ \t]|$)/)
  const highlightTokens = lang.match(/{([^}]*)}/)
  const filenameTokens = lang.match(/\[([^\]]*)\]/)
  const meta = lang.replace(/^\w*\s*(\[[^\]]*\]|\{[^}]*\})?\s*(\[[^\]]*\]|\{[^}]*\})?\s*/, '')

  return {
    language: language ? language[0] : undefined,
    highlights: parseHighlightedLines(highlightTokens && highlightTokens[1]),
    filename: Array.isArray(filenameTokens) && filenameTokens[1] ? filenameTokens[1] : undefined,
    meta
  }
}

function parseHighlightedLines (lines?: string | null) {
  const lineArray = String(lines || '')
    .split(',')
    .filter(Boolean)
    .flatMap((line) => {
      const [start, end] = line.trim().split('-').map(a => Number(a.trim()))
      return Array.from({ length: (end || start) - start + 1 }).map((_, i) => start + i)
    })
  return lineArray.length ? lineArray : undefined
}

const TAG_NAME_REGEXP = /^<\/?([A-Za-z0-9-_]+) ?[^>]*>/
export function getTagName (value: string) {
  const result = String(value).match(TAG_NAME_REGEXP)

  return result && result[1]
}

// mdast-util-to-hast/lib/wrap.js
/**
 * Wrap `nodes` with line feeds between each entry.
 * Optionally adds line feeds at the start and end.
 */
export function wrap (nodes: any[], loose = false) {
  const result = []
  let index = -1

  if (loose) {
    result.push(u('text', '\n'))
  }

  while (++index < nodes.length) {
    if (index) { result.push(u('text', '\n')) }
    result.push(nodes[index])
  }

  if (loose && nodes.length > 0) {
    result.push(u('text', '\n'))
  }

  return result
}
