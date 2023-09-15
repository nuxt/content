import { withoutTrailingSlash } from 'ufo'
import type { NavItem, ParsedContent } from '../types'
import { computed, shallowReactive, shallowRef, useState, useRoute } from '#imports'

export const useContentState = <G extends object = Record<string, unknown>>() => {
  /**
   * Map of loaded pages.
  */
  const pages = useState<Record<string, ParsedContent>>('dd-pages', () => shallowRef(shallowReactive({})))

  /**
   * Previous and next page data.
   * Format: { 'route': [prev, next] }
   */
  const surrounds = useState<Record<string, [Omit<ParsedContent, 'body'> | null, Omit<ParsedContent, 'body'> | null]>>('dd-surrounds', () => shallowRef(shallowReactive({})))

  /**
   * Navigation tree from root of app.
   */
  const navigation = useState<NavItem[]>('dd-navigation')

  /**
   * Globally loaded themes files.
   * Format: { [key: string]: unknown }
   */
  const globals = useState<Record<string, G>>('dd-globals', () => shallowRef(shallowReactive({})))

  return {
    pages,
    surrounds,
    navigation,
    globals
  }
}

export const useContent = <T extends ParsedContent, G extends object = Record<string, unknown>>() => {
  const { navigation, pages, surrounds, globals } = useContentState<G>()

  const _path = computed(() => withoutTrailingSlash(useRoute().path))

  /**
   * Current `page` key, computed from path and content state.
   */
  const page = computed(() => pages.value[_path.value] as T)

  /**
   * Current `surround` key, computed from path and content state.
   */
  const surround = computed(() => surrounds.value[_path.value])

  /**
   * Table of contents from `page`.
   */
  const toc = computed(() => page?.value?.body?.toc)

  /**
   * Content type from `page`.
   */
  const type = computed(() => page.value?._type)

  /**
   * Excerpt from `page`.
   */
  const excerpt = computed(() => page.value?.excerpt)

  /**
   * Layout type from `page`.
   */
  const layout = computed(() => page.value?.layout)

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
