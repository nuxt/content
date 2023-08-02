<script lang="ts">
import { toRefs, defineComponent, h, useSlots, computed, type PropType, type VNode } from 'vue'
import { hash } from 'ohash'
import type { NavItem, QueryBuilderParams, QueryBuilder } from '../types'
import { useAsyncData, fetchContentNavigation, useState, useContent } from '#imports'
import { NuxtLink } from '#components'

const ContentNavigation = defineComponent({
  name: 'ContentNavigation',
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

    // If doc driven mode and no query given, re-use the fetched navigation
    if (!queryBuilder.value && useState('dd-navigation').value) {
      const { navigation } = useContent()

      return { navigation }
    }
    const { data: navigation } = await useAsyncData<NavItem[]>(
      `content-navigation-${hash(queryBuilder.value)}`,
      () => fetchContentNavigation(queryBuilder.value)
    )
    return { navigation }
  },

  /**
   * Navigation empty fallback
   * @slot empty
   */
  render (ctx: { navigation: NavItem[] }) {
    const slots = useSlots()

    const { navigation } = ctx
    const renderLink = (link: NavItem) => h(NuxtLink, { to: link._path }, () => link.title)
    const renderLinks = (data: NavItem[], level: number): VNode =>
      h(
        'ul',
        level ? { 'data-level': level } : null,
        data.map((link) => {
          if (link.children) {
            return h('li', null, [renderLink(link), renderLinks(link.children, level + 1)])
          }
          return h('li', null, renderLink(link))
        })
      )
    const defaultNode = (data: NavItem[]) => renderLinks(data, 0)

    // Render default slot with navigation as `data`
    return slots?.default
      ? slots.default({ navigation, ...this.$attrs })
      : defaultNode(navigation)
  }
})

export default ContentNavigation as typeof ContentNavigation & {
  new (): {
    $slots: {
      default: ({ navigation }: { navigation: NavItem[] }) => VNode[] | undefined
    }
  }
}
</script>
