import { unref, watch, Ref } from 'vue'
import { useState } from '#app'
import type { Theme } from 'shiki-es'
import type { HighlightParams, HighlightThemedToken } from '../types'
import { withContentBase } from './content'

/**
 * Fetch highlight result
 */
const highlightFetch = (body: Partial<HighlightParams>): Promise<HighlightThemedToken[][]> =>
  $fetch<any>(withContentBase('/highlight'), { method: 'POST', body })

/**
 * Highlight code
 */
export const useContentHighlight = async (code: Ref<string>, options: Ref<{ lang?: string, theme?: Theme }>) => {
  // Use `useState` to get server state when client side
  const stateKey = `${unref(code)}-${unref(options).lang}`
  const hlCode = useState<HighlightThemedToken[][]>(stateKey)

  const fetch = async () => {
    const { lang, theme } = unref(options)

    if (lang) {
      hlCode.value = await highlightFetch({
        code: unref(code),
        lang,
        theme
      })
    } else {
      hlCode.value = [[{ content: unref(code) }]]
    }
  }

  // Only fetch if state is empty (only server side if SSR)
  if (!hlCode.value) {
    await fetch()
  }

  // Makes highlight feature reactive (useful for development)
  watch([code, options], fetch)

  return hlCode
}
