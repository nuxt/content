import type { Theme, Lang } from 'shiki-es'
import type { HighlightParams, HighlightThemedToken } from '../types'
import { withContentBase } from './utils'

type HighlightCodeOptions = { lang?: Lang, theme?: Theme }

/**
 * Fetch highlight result
 */
const highlightFetch = (body: Partial<HighlightParams>): Promise<HighlightThemedToken[][]> =>
  $fetch<any>(withContentBase('/highlight'), { method: 'POST', body })

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
