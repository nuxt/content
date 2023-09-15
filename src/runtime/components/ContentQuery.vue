<script lang="ts">
import { hash } from 'ohash'
import { type PropType, type VNode, toRefs, defineComponent, h, useSlots, watch } from 'vue'
import type { ParsedContent, ParsedContentMeta, QueryBuilder, SortParams } from '../types'
import { computed, useAsyncData, queryContent, useRuntimeConfig } from '#imports'

const ContentQuery = defineComponent({
  name: 'ContentQuery',
  props: {
    /**
     * The path of the content to load from content source.
     */
    path: {
      type: String,
      required: false,
      default: undefined
    },
    /**
     * Select a subset of fields
     */
    only: {
      type: Array as PropType<Array<string>>,
      required: false,
      default: undefined
    },
    /**
     * Remove a subset of fields
     */
    without: {
      type: Array as PropType<Array<string>>,
      required: false,
      default: undefined
    },
    /**
     * Filter results
     */
    where: {
      type: Object as PropType<{ [key: string]: any }>,
      required: false,
      default: undefined
    },
    /**
     * Sort results
     */
    sort: {
      type: Object as PropType<SortParams>,
      required: false,
      default: undefined
    },
    /**
     * Limit number of results
     */
    limit: {
      type: Number as PropType<number>,
      required: false,
      default: undefined
    },
    /**
     * Skip number of results
     */
    skip: {
      type: Number as PropType<number>,
      required: false,
      default: undefined
    },
    /**
     * Filter contents based on locale
     */
    locale: {
      type: String as PropType<string>,
      required: false,
      default: undefined
    },
    /**
     * A type of query to be made.
     */
    find: {
      type: String as PropType<'one' | 'surround'>,
      required: false,
      default: undefined
    }
  },
  async setup (props) {
    const {
      path,
      only,
      without,
      where,
      sort,
      limit,
      skip,
      locale,
      find
    } = toRefs(props)

    /**
     * Check if supplied path refers to partial content.
     *
     * Might be skipping `partial: true` marked in Markdown contents front-matter.
     */
    const isPartial = computed(() => path.value?.includes('/_'))

    const legacy = !useRuntimeConfig().public.content.experimental.advanceQuery

    watch(() => props, () => refresh(), { deep: true })

    const resolveResult = (result: any) => {
      if (legacy) {
        if (result?.surround) {
          return result.surround
        }

        return result?._id || Array.isArray(result) ? result : result?.result
      }

      return result.result
    }

    const { data, refresh } = await useAsyncData<ParsedContent | ParsedContent[] | [ParsedContent | undefined, ParsedContent | undefined]>(
      `content-query-${hash(props)}`,
      () => {
        let queryBuilder: QueryBuilder

        if (path.value) {
          queryBuilder = queryContent(path.value)
        } else {
          queryBuilder = queryContent()
        }

        if (only.value) { queryBuilder = queryBuilder.only(only.value) as QueryBuilder<ParsedContentMeta> }

        if (without.value) { queryBuilder = queryBuilder.without(without.value) as QueryBuilder<ParsedContentMeta> }

        if (where.value) { queryBuilder = queryBuilder.where(where.value) }

        if (sort.value) { queryBuilder = queryBuilder.sort(sort.value) }

        if (limit.value) { queryBuilder = queryBuilder.limit(limit.value) }

        if (skip.value) { queryBuilder = queryBuilder.skip(skip.value) }

        if (locale.value) { queryBuilder = queryBuilder.where({ _locale: locale.value }) }

        if (find.value === 'one') { return queryBuilder.findOne().then(resolveResult) as Promise<ParsedContent> }

        if (find.value === 'surround') {
          if (!path.value) {
            // eslint-disable-next-line no-console
            console.warn('[Content] Surround queries requires `path` prop to be set.')
            // eslint-disable-next-line no-console
            console.warn('[Content] Query without `path` will return regular `find()` results.')
            return queryBuilder.find().then(resolveResult) as Promise<ParsedContent[]>
          }

          if (legacy) {
            return queryBuilder.findSurround(path.value) as Promise<[ParsedContent | undefined, ParsedContent | undefined]>
          } else {
            // @ts-ignore
            return queryBuilder.withSurround(path.value).findOne().then(resolveResult)
          }
        }

        return queryBuilder.find().then(resolveResult) as Promise<ParsedContent[]>
      }
    )

    return {
      isPartial,
      data,
      refresh
    }
  },

  /**
   * Content not found fallback
   * @slot not-found
   */
  render (ctx: any) {
    const slots = useSlots()

    const {
      // Setup
      data,
      refresh,
      isPartial,
      // Props
      path,
      only,
      without,
      where,
      sort,
      limit,
      skip,
      locale,
      find
    } = ctx

    // We cannot use `...props` in a render function, Vue optimization might make it static.
    const props = {
      path,
      only,
      without,
      where,
      sort,
      limit,
      skip,
      locale,
      find
    }

    if (props.find === 'one') {
      // Handle `findOne()` #empty/#not-found content

      // If `type` is `one` and `data` is `undefined render the #not-found slot.
      if (!data && slots?.['not-found']) { return slots['not-found']({ props, ...this.$attrs }) }

      // Empty slots for `one` if type is "markdown" refers to an empty `body.children` key.
      if (slots?.empty && data?._type === 'markdown' && !data?.body?.children.length) { return slots.empty({ props, ...this.$attrs }) }
    } else if (!data || !data.length) {
      // Handle `find()` and `findSurround()`

      // These functions does not handle "empty" slots, as "empty" refers to missing content in `body` of the document.
      if (slots?.['not-found']) { return slots['not-found']({ props, ...this.$attrs }) }
    }

    // Return default slot if present
    if (slots?.default) { return slots.default({ data, refresh, isPartial, props, ...this.$attrs }) }

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentQuery>!', slot, data }, null, 2))

    // Return empty node if not any slot not preset.
    return emptyNode('default', { data, props, isPartial })
  }
})

export interface ContentQueryDefaultSlotContext {
  data: ParsedContent | Array<ParsedContent>
  refresh: () => Promise<void>
  isPartial: boolean
}

export default ContentQuery as typeof ContentQuery & {
  new (): {
    $slots: {
      default: (context: ContentQueryDefaultSlotContext) => VNode[] | undefined
    }
  }
}
</script>
