import type { ParsedContent } from '@nuxt/content'

export interface ParsedArticle extends ParsedContent {
  cover: {
    image: string,
    alt: string
  }
  publishedAt: string
}
