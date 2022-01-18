import { onUnmounted } from 'vue'
import { withBase } from 'ufo'
import { createQuery } from '../query'
import { useFetch, useNuxtApp } from '#imports'

const withContentBase = (url: string) => withBase(url, '/api/_docus')

/**
 * Fetch list of contents
 */
export const getContentList = () => $fetch<any>(withContentBase('/list'))

/**
 * Use list of contents
 *
 * Every time a content is add, remove or update, list will update
 */
export const useContentList = () => {
  const nuxtApp = useNuxtApp()
  const promise = useFetch(withContentBase('/list'))

  const hook = () => promise.refresh()

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', hook)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', hook))

  return promise.then(({ data }: any) => data)
}

/**
 * Fetch a content by id
 */
export const getContent = (id: string) => $fetch<any>(withContentBase(`/get/${id}`))

/**
 * Fetch a content by id (Reactive version)
 */
export const useContent = (id: string) => {
  const nuxtApp = useNuxtApp()
  const promise = useFetch(withContentBase(`/get/${id}`))

  const hook = ({ key }: { key: string }) => {
    if (id === key) promise.refresh()
  }

  // @ts-ignore
  nuxtApp.hooks.hook('content:update', hook)

  // @ts-ignore
  onUnmounted(() => nuxtApp.hooks.removeHook('content:update', hook))

  return promise.then(({ data }: any) => data)
}

/**
 * Fetch query result
 */
const queryFetch = (body: Partial<QueryBuilderParams>) =>
  $fetch<any>(withContentBase('/query'), { method: 'POST', body })

/**
 * Query contents
 */
export const queryContent = (body?: string | Partial<QueryBuilderParams>, aq?: Partial<QueryBuilderParams>) => {
  if (typeof body === 'string') {
    body = {
      to: body,
      ...aq
    }
  }

  return createQuery(queryFetch, body)
}
