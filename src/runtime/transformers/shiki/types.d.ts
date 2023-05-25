import { Theme as ShikiTheme, IThemedToken } from 'shiki-es'
export type { MarkdownNode } from '../../types'

export type Theme = ShikiTheme | Record<string, ShikiTheme>

export type HighlightThemedTokenStyle = Pick<IThemedToken, 'color' | 'fontStyle'>

export type TokenStyleMap = Record<string, { 
  style: Record<string, HighlightThemedTokenStyle>
  className: string
}>

export interface HighlightParams {
  code: string
  lang: string
  theme: Theme
}

export interface HighlighterOptions {
  styleMap: TokenStyleMap
  highlights: Array<number>
}

export interface HighlightThemedToken {
  content: string
  style?: Record<string, HighlightThemedTokenStyle>
}

export interface HighlightThemedTokenLine {
  key: string
  tokens: HighlightThemedToken[]
}
