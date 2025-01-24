import type { Ref } from 'vue'
import type { AsyncDataOptions } from '#app'
import { useAsyncData } from '#app/composables/asyncData'
import { useNuxtApp } from '#app/nuxt'

export function useAsyncState<T>(key: string, fn: () => Promise<T>, options?: AsyncDataOptions<T>) {
  const nuxt = useNuxtApp()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unique = nuxt.payload.unique = nuxt.payload.unique || {} as any
  if (!unique[key])
    unique[key] = useAsyncData(key, fn, options)

  return unique[key].data as Ref<T | null>
}
