import type { Theme, Lang } from 'shiki-es'
import type { HighlightParams, HighlightThemedToken } from '../types'
import { contentApiWithParams } from './utils'

type HighlightCodeOptions = { lang?: Lang, theme?: Theme }

/**
 * Fetch highlight result
 */
const highlightFetch = (body: Partial<HighlightParams>) =>
  $fetch<HighlightThemedToken[][]>(contentApiWithParams('/highlight', body))

/**
 * Highlight code
 */
export function highlightCode (code: string, options: HighlightCodeOptions) {
  return highlightFetch({
    code,
    lang: options?.lang,
    theme: options?.theme
  })
}
