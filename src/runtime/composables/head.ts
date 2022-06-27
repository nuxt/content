import { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import type { HeadObjectPlain } from '@vueuse/head'
import type { Ref } from 'vue'
import { ParsedContent } from '../types'
import { useRoute, nextTick, useHead, unref, nextTick, watch } from '#imports'

export const useContentHead = (
  _content: ParsedContent | Ref<ParsedContent>,
  to: RouteLocationNormalized | RouteLocationNormalizedLoaded = useRoute()
) => {
  const content = unref(_content)

  const refreshHead = (data: ParsedContent = content) => {
    // Don't call this function if no route is yet available
    if (!to.path || !data) { return }

    // Default head to `data?.head`
    const head: HeadObjectPlain = Object.assign({}, data?.head || {})

    // Great basic informations from the data
    head.title = head.title || data?.title
    head.meta = head.meta || []

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
          content: head.image
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
              content: image[key]
            })
          } else if (image[key]) {
            head.meta.push({
              property: `og:${key}`,
              content: image[key]
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
