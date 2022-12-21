import { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import type { HeadObjectPlain } from '@vueuse/head'
import type { Ref } from 'vue'
import { joinURL } from 'ufo'
import { ParsedContent } from '../types'
import { useRoute, nextTick, useHead, unref, watch } from '#imports'

export const useContentHead = (
  _content: ParsedContent | Ref<ParsedContent>,
  to: RouteLocationNormalized | RouteLocationNormalizedLoaded = useRoute()
) => {
  const content = unref(_content)
  const config = useRuntimeConfig()

  const refreshHead = (data: ParsedContent = content) => {
    // Don't call this function if no route is yet available
    if (!to.path || !data) { return }

    // Default head to `data?.head`
    const head: HeadObjectPlain = Object.assign({}, data?.head || {})

    head.meta = [...(head.meta || [])]
    head.link = [...(head.link || [])]

    // Great basic informations from the data
    const title = head.title || data?.title
    if (title) {
      head.title = title
      if (!head.meta.some(m => m.property === 'og:title')) {
        head.meta.push({
          name: 'og:title',
          content: title
        })
      }
    }

    const host = config.public.content.host
    if (host && !head.link.some(m => m.rel === 'canonical')) {
      head.link.push({
        rel: 'canonical',
        href: joinURL(host, config.app.baseURL, to.fullPath)
      })
    }
    const url = joinURL(host, config.app.baseURL, to.fullPath)
    if (host && !head.meta.some(m => m.property === 'og:url')) {
      head.meta.push({
        name: 'og:url',
        // TODO: support configuration for trailing slash
        content: url
      })
    }

    // Grab description from `head.description` or fallback to `data.description`
    // @ts-ignore - We expect `head.description` from Nuxt configurations...
    const description = head?.description || data?.description

    // Shortcut for head.description
    if (description && head.meta.filter(m => m.name === 'description').length === 0) {
      head.meta.push({
        name: 'description',
        content: description
      })
    }

    // Grab description from `head` or fallback to `data.description`
    // @ts-ignore - We expect `head.image` from Nuxt configurations...
    const image = head?.image || data?.image

    // Shortcut for head.image to og:image in meta
    if (image && head.meta.filter(m => m.property === 'og:image').length === 0) {
      // Handles `image: '/image/src.jpg'`
      if (typeof image === 'string') {
        head.meta.push({
          property: 'og:image',
          // @ts-ignore - We expect `head.image` from Nuxt configurations...
          content: new URL(joinURL(config.app.baseURL, image), url).href
        })
      }

      // Handles: `image.src: '/image/src.jpg'` & `image.alt: 200`...
      if (typeof image === 'object') {
        // https://ogp.me/#structured
        const imageKeys = [
          'src',
          'secure_url',
          'type',
          'width',
          'height',
          'alt'
        ]

        // Look on available keys
        for (const key of imageKeys) {
          // `src` is a shorthand for the URL.
          if (key === 'src' && image.src) {
            head.meta.push({
              property: 'og:image',
              content: new URL(joinURL(config.app.baseURL, image[key]), url).href
            })
          } else if (image[key]) {
            head.meta.push({
              property: `og:image:${key}`,
              content: new URL(joinURL(config.app.baseURL, image[key]), url).href
            })
          }
        }
      }
    }

    // @ts-ignore
    if (process.client) { nextTick(() => useHead(head)) } else { useHead(head) }
  }

  watch(() => unref(_content), refreshHead, { immediate: true })
}
