import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { NavItem } from '../types'
import { withContentBase } from './content'
// @ts-ignore
import { useNuxtApp } from '#imports'

/**
 * Navigation
 */
export const useContentNavigation = (prefix: string | Ref<string> = ref(null)): Promise<NavItem[]> => {
  const nuxtApp = useNuxtApp()
  const navigation = ref(null)
  const fetch = () => $fetch<NavItem[]>(withContentBase('/navigation'), {
    params: {
      prefix: typeof prefix === 'string' ? prefix : prefix.value
    }
  }).then(data => (navigation.value = data))

  // Watch for changes
  if (typeof prefix !== 'string') {
    watch(() => prefix.value, fetch)
  }

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', fetch)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', fetch))

  return fetch().then(() => navigation)
}
