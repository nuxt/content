import { PropType, toRefs, defineComponent, h, useSlots, computed } from 'vue'
import { hash } from 'ohash'
import type { NavItem, QueryBuilderParams } from '../types'
import { QueryBuilder } from '../types'
import { useAsyncData, fetchContentNavigation } from '#imports'

export default defineComponent({
  props: {
    /**
     * A query to be passed to `fetchContentNavigation()`.
     */
    query: {
      type: Object as PropType<QueryBuilderParams | QueryBuilder>,
      required: false,
      default: undefined
    }
  },
  async setup (props) {
    const {
      query
    } = toRefs(props)

    const queryBuilder = computed(() => {
      /*
       * We need to extract params from a possible QueryBuilder beforehand
       * so we don't end up with a duplicate useAsyncData key.
       */
      if (typeof query.value?.params === 'function') {
        return query.value.params()
      }

      return query.value
    })

    const { data, refresh } = await useAsyncData<NavItem[]>(
      `content-navigation-${hash(queryBuilder.value)}`,
      () => fetchContentNavigation(queryBuilder.value)
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

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentNavigation>', slot, data }, null, 2))

    // Render empty data object
    if (slots?.empty && (!data || !data?.length)) {
      return slots?.empty?.({ query, ...this.$attrs }) || emptyNode('empty', { query, data })
    }

    // Render default slot with navigation as `data`
    return slots?.default
      ? slots.default({ navigation: data, refresh, ...this.$attrs })
      : emptyNode('default', data)
  }
})
