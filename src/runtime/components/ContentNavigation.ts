import { PropType, toRefs, defineComponent, h, useSlots } from 'vue'
import { hash } from 'ohash'
import type { NavItem, QueryBuilderParams } from '../types'
import { useAsyncData, fetchContentNavigation } from '#imports'

export default defineComponent({
  props: {
    /**
     * A query to be passed to `fetchContentNavigation()`.
     */
    query: {
      type: Object as PropType<QueryBuilderParams>,
      required: false,
      default: undefined
    }
  },
  async setup (props) {
    const {
      query
    } = toRefs(props)

    const { data, refresh } = await useAsyncData<NavItem[]>(
      `content-navigation-${hash(query.value)}`,
      () => fetchContentNavigation(query.value)
    )

    return {
      data,
      refresh
    }
  },
  render (ctx) {
    const slots = useSlots()

    const {
      query,
      data,
      refresh
    } = ctx

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentNavigation>!', slot, data }, null, 2))

    // Render empty data object
    if (slots?.empty && (!data || !data?.length)) {
      return slots?.empty?.({ query }) || emptyNode('empty', { query, data })
    }

    // Render default slot with navigation as `data`
    return slots?.default
      ? slots.default({ navigation: data, refresh })
      : emptyNode('default', data)
  }
})
