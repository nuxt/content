import { defineEventHandler } from 'h3'
import type { NavItem } from '@nuxt/content'
import { useRuntimeConfig } from '#imports'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  const { getContentIndex } = await import('../content-index')
  const { cacheStorage, serverQueryContent } = await import('../storage')

  const { content } = useRuntimeConfig()
  const now = Date.now()
  // Fetch all content
  const contents = await serverQueryContent(event).find()

  // Generate Index
  await getContentIndex(event)

  const navigation: NavItem[] = await $fetch(`${content.api.baseURL}/navigation`)
  await cacheStorage().setItem('content-navigation.json', navigation)

  return {
    generatedAt: now,
    generateTime: Date.now() - now,
    contents: content.experimental.cacheContents ? contents : [] as any,
    navigation
  }
})
