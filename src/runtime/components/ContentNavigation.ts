import { PropType, toRefs, defineComponent, h, useSlots } from 'vue'
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
      'content-navigation',
      () => {
        return fetchContentNavigation(query.value)
      }
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

    // Render empty data object
    if (!data || !data?.length || !slots?.default) {
      return slots?.empty?.({ query })
    }

    // Render default slot with navigation as `data`
    return slots?.default?.({ navigation: data, refresh }) || h('pre', undefined, JSON.stringify(data, null, 2))
  }
})
