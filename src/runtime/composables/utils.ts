import { withBase } from 'ufo'
import { useRuntimeConfig, useRequestEvent, useCookie, useRoute } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'
import type { useContent } from './content'

export const withContentBase = (url: string) => withBase(url, useRuntimeConfig().public.content.api.baseURL)

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})

export const useContentDisabled = (): ReturnType<typeof useContent> => {
  // Console warnings
  // eslint-disable-next-line no-console
  console.warn('useContent is only accessible when you are using `documentDriven` mode.')
  // eslint-disable-next-line no-console
  console.warn('Learn more by visiting: https://content.nuxtjs.org/guide/writing/document-driven')

  // Break app
  throw new Error('useContent is only accessible when you are using `documentDriven` mode.')
}

export const navigationDisabled = () => {
  // Console warnings
  // eslint-disable-next-line no-console
  console.warn('Navigation is only accessible when you enable it in module options.')
  // eslint-disable-next-line no-console
  console.warn('Learn more by visiting: https://content.nuxtjs.org/api/configuration#navigation')

  // Break app
  throw new Error('Navigation is only accessible when you enable it in module options.')
}

export const addPrerenderPath = (path: string) => {
  const event = useRequestEvent()
  event.res.setHeader(
    'x-nitro-prerender',
    [
      event.res.getHeader('x-nitro-prerender'),
      path
    ].filter(Boolean).join(',')
  )
}

export const shouldUseClientDB = () => {
  const { experimental } = useRuntimeConfig().public.content
  if (process.server) { return false }
  if (experimental.clientDB) { return true }

  const query = useRoute().query
  // Disable clientDB when `?preview` is set in query, and it has falsy value
  if (Object.prototype.hasOwnProperty.call(query, 'preview') && !query.preview) {
    return false
  }
  // Enable clientDB when preview mode is enabled
  if (query.preview || useCookie('previewToken').value) {
    if (process.dev) {
      console.warn('[content] Client DB enabled since a preview token is set (either in query or cookie).')
    }
    return true
  }

  return false
}
