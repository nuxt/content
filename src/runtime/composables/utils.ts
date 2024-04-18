import { withBase } from 'ufo'
import type { useContent } from './content'
import { useContentPreview } from './preview'
import { useRuntimeConfig, useRequestEvent } from '#imports'

export const withContentBase = (url: string) => withBase(url, useRuntimeConfig().public.content.api.baseURL)

export const useContentDisabled = (): ReturnType<typeof useContent> => {
  // Console warnings
   
  console.warn('useContent is only accessible when you are using `documentDriven` mode.')
   
  console.warn('Learn more by visiting: https://content.nuxt.com/document-driven')

  // Break app
  throw new Error('useContent is only accessible when you are using `documentDriven` mode.')
}

export const navigationDisabled = () => {
  // Console warnings

  console.warn('Navigation is only accessible when you enable it in module options.')
   
  console.warn('Learn more by visiting: https://content.nuxt.com/get-started/configuration#navigation')

  // Break app
  throw new Error('Navigation is only accessible when you enable it in module options.')
}

export const addPrerenderPath = (path: string) => {
  const event = useRequestEvent()
  if (event) {
    event.node.res.setHeader(
      'x-nitro-prerender',
      [
        event.node.res.getHeader('x-nitro-prerender'),
        path
      ].filter(Boolean).join(',')
    )
  }
}

export const shouldUseClientDB = () => {
  const { experimental } = useRuntimeConfig().public.content
  if (import.meta.server) { return false }
  if (experimental.clientDB) { return true }

  return useContentPreview().isEnabled()
}
