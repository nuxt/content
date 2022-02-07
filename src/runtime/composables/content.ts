import { onUnmounted, Ref } from 'vue'
import { withBase } from 'ufo'
import type { ParsedContentMeta, ParsedContent } from '../types'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#imports'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)

/**
 * Fetch list of contents
 */
export const getContentList = () => $fetch<Array<ParsedContentMeta>>(withContentBase('/list'))

/**
 * Use list of contents
 *
 * Every time a content is add, remove or update, list will update
 */
export const useContentList = () => {
  const nuxtApp = useNuxtApp()
  const promise = useFetch<Array<ParsedContentMeta>>(withContentBase('/list'))

  const hook = () => promise.refresh()

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', hook)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', hook))

  return promise.then((res: any) => res.data as Ref<Array<ParsedContentMeta>>)
}

/**
 * Fetch a content by id
 */
export const getContent = (id: string) => $fetch<ParsedContent>(withContentBase(`/get/${id}`))

/**
 * Fetch a content by id (Reactive version)
 */
export const useContent = (id: string) => {
  const nuxtApp = useNuxtApp()
  const promise = useFetch(withContentBase(`/get/${id}`))

  const hook = ({ key }: { key: string }) => {
    if (id === key) {
      promise.refresh()
    }
  }

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', hook)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', hook))

  return promise.then((res: any) => res.data as Ref<ParsedContent>)
}
