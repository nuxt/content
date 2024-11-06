import type { PageCollectionItemBase } from '@nuxt/content'
import { hasProtocol, withTrailingSlash, withoutTrailingSlash, joinURL } from 'ufo'
import { useRuntimeConfig, useRoute, useHead } from '#imports'

export const useContentHead = (content: PageCollectionItemBase | null, { host, trailingSlash }: { host?: string, trailingSlash?: boolean } = {}) => {
  if (!content) {
    return
  }

  const config = useRuntimeConfig()
  const route = useRoute()
  // Default head to `data?.seo`
  const head = Object.assign({} as unknown as Exclude<PageCollectionItemBase['seo'], undefined>, content?.seo || {})

  head.meta = [...(head.meta || [])]
  head.link = [...(head.link || [])]

  // Great basic informations from the content
  head.title = head.title || content?.title
  if (head.title) {
    if (import.meta.server && !head.meta?.some(m => m.property === 'og:title')) {
      head.meta.push({
        property: 'og:title',
        content: head.title as string,
      })
    }
  }

  if (import.meta.server && host) {
    const _url = joinURL(host ?? '/', config.app.baseURL, route.fullPath)
    const url = trailingSlash ? withTrailingSlash(_url) : withoutTrailingSlash(_url)
    if (!head.meta.some(m => m.property === 'og:url')) {
      head.meta.push({
        property: 'og:url',
        content: url,
      })
    }
    if (!head.link.some(m => m.rel === 'canonical')) {
      head.link.push({
        rel: 'canonical',
        href: url,
      })
    }
  }

  // Grab description from `head.description` or fallback to `data.description`
  const description = head?.description || content?.description

  // Shortcut for head.description
  if (description && head.meta.filter(m => m.name === 'description').length === 0) {
    head.meta.push({
      name: 'description',
      content: description,
    })
  }
  if (import.meta.server && description && !head.meta.some(m => m.property === 'og:description')) {
    head.meta.push({
      property: 'og:description',
      content: description,
    })
  }

  // Grab description from `head` or fallback to `data.description`
  // @ts-expect-error - image does not exists in content
  const image = head?.image || content?.image

  // Shortcut for head.image to og:image in meta
  if (image && head.meta.filter(m => m.property === 'og:image').length === 0) {
    // Handles `image: '/image/src.jpg'`
    if (typeof image === 'string') {
      head.meta.push({
        property: 'og:image',
        content: host && !hasProtocol(image) ? new URL(joinURL(config.app.baseURL, image), host).href : image,
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
        'alt',
      ]

      // Look on available keys
      for (const key of imageKeys) {
        // `src` is a shorthand for the URL.
        if (key === 'src' && image.src) {
          const isAbsoluteURL = hasProtocol(image.src)
          const imageURL = isAbsoluteURL ? image.src : joinURL(config.app.baseURL, image.src ?? '/')
          head.meta.push({
            property: 'og:image',
            content: host && !isAbsoluteURL ? new URL(imageURL, host).href : imageURL,
          })
        }
        else if (image[key]) {
          head.meta.push({
            property: `og:image:${key}`,
            content: image[key],
          })
        }
      }
    }
  }

  useHead(head)
}
