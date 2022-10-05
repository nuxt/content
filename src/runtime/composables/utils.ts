import { withBase } from 'ufo'
import { useRuntimeConfig, useRequestEvent, useCookie, useRoute } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})

export const useContentDisabled = () => {
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
  console.warn('Navigation is only accessible when you are enabling it in module options.')
  // eslint-disable-next-line no-console
  console.warn('Learn more by visiting: https://content.nuxtjs.org/api/configuration#navigation')

  // Break app
  throw new Error('Navigation is only accessible when you are enabling it in module options.')
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
  const { previewAPI, clientDB } = useRuntimeConfig().content
  if (!process.client) { return false }
  if (clientDB?.isSPA) { return true }

  // Disable clientDB when preview mode is disabled
  if (!previewAPI) { return false }
  if (useRoute().query?.preview || useCookie('previewToken').value) {
    return true
  }

  return false
}
