import { withBase } from 'ufo'
import { useHead, useRuntimeConfig } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const useContentPrefetch = (href: string) => {
  const { prefetch } = useRuntimeConfig().content
  // Add `prefetch` to `<head>` in production
  if (!process.dev && process.server && prefetch) {
    useHead({
      link: [
        { rel: 'prefetch', href }
      ]
    })
  }
}

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
