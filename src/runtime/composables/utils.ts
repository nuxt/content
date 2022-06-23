import { withBase } from 'ufo'
import { useRuntimeConfig } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})

export const useContentDisabled = () => {
  // Console warnings
  console.warn('useContent is only accessible when you are using `documentDriven` mode.')
  console.warn('Learn more by visiting: https://content.nuxtjs.org/guide/writing/document-driven')

  // Break app
  throw new Error('useContent is only accessible when you are using `documentDriven` mode.')
}
