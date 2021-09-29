import Vue from 'vue'
import type { CombinedVueInstance } from 'vue/types/vue'
import { Context } from '@nuxt/types'
import { getCurrentInstance, Ref, ref } from '@nuxtjs/composition-api'

const createPlugin = <T = any>(key: string, defaultValue: T) => {
  const store = ref(defaultValue || {})

  // Nuxt plugin
  return ({ ssrContext, nuxtState }: Context) => {
    const state = process.server ? ssrContext!.nuxt : nuxtState

    state.stores = state.stores || {}

    if (process.server) {
      state.stores[key] = store
    } else {
      Object.assign(store, state.stores?.[key] || {})
    }
  }
}

export function createStore<T>(key: string, defaultValue: T) {
  const plugin = createPlugin(key, defaultValue)

  function useStore(context?: CombinedVueInstance<Vue, object, object, object, Record<never, any>> | Context): Ref<T> {
    // Get from setup() context
    if (!context) {
      const vm = getCurrentInstance()
      if (!vm) throw new Error('useStore must be called in setup() or a context provided')
      context = vm.proxy as CombinedVueInstance<Vue, object, object, object, Record<never, any>>
    }

    // Get from any other context
    let state
    if (process.server) {
      state = '$ssrContext' in context ? context.$ssrContext.nuxt : context.ssrContext?.nuxt
    } else {
      // @ts-ignore
      state = window.__NUXT__
    }

    return state.stores[key]
  }

  return {
    plugin,
    useStore
  }
}
