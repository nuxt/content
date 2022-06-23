import type { NavItem, ParsedContent } from '../types'
import { computed, useState, useRuntimeConfig } from '#imports'

export const useContentState = () => {
  /**
   * Current page complete data.
   */
  const page = useState<ParsedContent>('content-document-driven-page')

  /**
   * Navigation tree from root of app.
   */
  const navigation = useState<NavItem[]>('content-document-driven-navigation')

  /**
   * Previous and next page data.
   * Format: [prev, next]
   */
  const surround = useState<Omit<ParsedContent, 'body'>[]>('content-document-driven-page-surround')

  /**
   * Globally loaded content files.
   * Format: { [key: string]: ParsedContent }
   */
  const globals = useState<Record<string, ParsedContent>>('content-document-driven-globals', () => ({}))

  return {
    page,
    navigation,
    surround,
    globals
  }
}

export const useContent = () => {
  const { navigation, page, surround, globals } = useContentState()

  /**
   * Table of contents from `page`.
   */
  const toc = computed(() => page?.value?.body?.toc)

  /**
   * Content type from `page`.
   */
  const type = computed(() => page.value?.meta?.type)

  /**
   * Excerpt from `page`.
   */
  const excerpt = computed(() => page.value?.excerpt)

  /**
   * Layout type from `page`.
   */
  const layout = computed(() => page.value?.meta?.layout)

  /**
   * Next page from `surround`.
   */
  const next = computed(() => surround.value?.[1])

  /**
   * Previous page from `surround`.
   */
  const prev = computed(() => surround.value?.[0])

  return {
    // Refs
    globals,
    navigation,
    surround,
    page,
    // From page
    excerpt,
    toc,
    type,
    layout,
    // From surround
    next,
    prev
  }
}
