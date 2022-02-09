import { onUnmounted, Ref } from 'vue'
import { withBase } from 'ufo'
import type { ParsedContentMeta, ParsedContent } from '../types'
import { useNuxtApp, useRuntimeConfig } from '#imports'

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
  const list = ref([] as Array<ParsedContentMeta>)

  const fetch = () => getContentList().then(con => (list.value = con))

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', fetch)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', fetch))

  return fetch().then(() => list)
}

/**
 * Fetch a content by id
 */
export const getContentDocument = (id: string) => $fetch<ParsedContent>(withContentBase(`/get/${id}`))

/**
 * Fetch a content by id (Reactive version)
 */
export const useContentDocument = (id: Ref<string>) => {
  const nuxtApp = useNuxtApp()
  const content = ref(null)

  const fetch = () => getContentDocument(id.value).then(con => (content.value = con))

  watch(() => id.value, fetch)

  const hook = ({ key }: { key: string }) => {
    if ((id.value) === key) {
      fetch()
    }
  }

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', hook)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', hook))

  return fetch().then(() => content)
}
