import type { ParsedContent } from '../../../src/runtime/types'

export interface ParsedArticle extends ParsedContent {
  cover: {
    image: string,
    alt: string
  }
  publishedAt: string
}
