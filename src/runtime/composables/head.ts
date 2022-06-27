import { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import type { HeadObjectPlain } from '@vueuse/head'
import { ParsedContent } from '../types'
import { useRoute, nextTick, useHead } from '#imports'

export const useContentHead = (
  document: ParsedContent,
  to: RouteLocationNormalized | RouteLocationNormalizedLoaded = useRoute()
) => {
  // Don't call this function if no route is yet available
  if (!to.path) { return }

  // Default head to `document?.head`
  const head: HeadObjectPlain = Object.assign({}, document?.head || {})

  // Great basic informations from the document
  head.title = head.title || document.title
  head.meta = head.meta || []

  // Grab description from `head.description` or fallback to `document.description`
  // @ts-ignore - We expect `head.description` from Nuxt configurations...
  const description = head?.description || document.description

  // Shortcut for head.description
  if (description && head.meta.filter(m => m.name === 'description').length === 0) {
    head.meta.push({
      name: 'description',
      content: description
    })
  }

  // Grab description from `head` or fallback to `document.description`
  // @ts-ignore - We expect `head.image` from Nuxt configurations...
  const image = head?.image || document.image

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
