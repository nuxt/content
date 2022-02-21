import { unref, Ref } from 'vue'
import { useState } from '#app'
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
export const useContentHighlight = async (code: Ref<string>, lang: Ref<string>) => {
  if (!lang.value) {
    return [[{ content: code.value }]]
  }

  // Use `useState` to get server state when client side
  const stateKey = `${code.value}-${lang.value}`
  const hlCode = useState<HighlightThemedToken[][]>(stateKey)

  const fetch = async () => {
    hlCode.value = await highlightFetch({
      code: unref(code),
      lang: unref(lang)
    })
  }

  // Only fetch if state is empty (only server side if SSR)
  if (!hlCode.value) {
    await fetch()
  }

  // Makes highlight feature reactive (useful for development)
  watch([code, lang], fetch)

  return hlCode
}
