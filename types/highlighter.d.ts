import type { H } from 'mdast-util-to-hast'
import type { Node } from 'unist'
import unistBuilder from 'unist-builder'

export type ThematicBlock = {
  lineHighlights: string,
  fileName: string
}

export type AstUtility = {
  h: H,
  node: Node,
  u: typeof unistBuilder
}

export type AstReturns = Record<string, unknown>

export type Highlighter = (rawCode: string, lang: string, thematicBlock?: ThematicBlock, astUtility?: AstUtility) => string | AstReturns
export type PromisedHighlighter = () => Promise<Highlighter>
