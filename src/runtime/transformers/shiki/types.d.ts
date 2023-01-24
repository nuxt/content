import { Theme as ShikiTheme } from 'shiki-es'
export type { MarkdownNode } from '../../types'

export type Theme = ShikiTheme | Record<string, ShikiTheme>

export type TokenColorMap = Record<string, {colors: any, className: string}>

export interface HighlightParams {
  code: string
  lang: string
  theme: Theme
}

export interface HighlighterOptions {
  colorMap: TokenColorMap
  highlights: Array<number>
}

export interface HighlightThemedToken {
  content: string
  color?: string | Record<string, string>
}

export interface HighlightThemedTokenLine {
  key: string
  tokens: HighlightThemedToken[]
}
