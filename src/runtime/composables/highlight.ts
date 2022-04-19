import type { Theme, Lang } from 'shiki-es'
import type { HighlightParams, HighlightThemedToken } from '../types'
import { contentApiWithParams } from './utils'
import { useHead } from '#app'

type HighlightCodeOptions = { lang?: Lang, theme?: Theme }

/**
 * Fetch highlight result
 */
const highlightFetch = (params: Partial<HighlightParams>) => {
  const path = contentApiWithParams('/highlight', params)

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<HighlightThemedToken[][]>(path)
}

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
