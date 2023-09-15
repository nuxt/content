import { withBase } from 'ufo'
import type { useContent } from './content'
import { useContentPreview } from './preview'
import { useRuntimeConfig, useRequestEvent } from '#app'

export const withContentBase = (url: string) => withBase(url, useRuntimeConfig().public.content.api.baseURL)

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
  event.node.res.setHeader(
    'x-nitro-prerender',
    [
      event.node.res.getHeader('x-nitro-prerender'),
      path
    ].filter(Boolean).join(',')
  )
}

export const shouldUseClientDB = () => {
  const { experimental } = useRuntimeConfig().public.content
  if (process.server) { return false }
  if (experimental.clientDB) { return true }

  return useContentPreview().isEnabled()
}
