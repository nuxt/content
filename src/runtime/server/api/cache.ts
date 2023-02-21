import { defineEventHandler } from 'h3'
import { getContentIndex } from '../content-index'
import { cacheStorage, serverQueryContent } from '../storage'
import type { NavItem } from '../../types'
import { useRuntimeConfig } from '#imports'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  const { content } = useRuntimeConfig()
  const now = Date.now()
  // Fetch all content
  const contents = await serverQueryContent(event).find()

  // Generate Index
  await getContentIndex(event)

  const navigation: NavItem[] = await $fetch(`${content.api.baseURL}/navigation`)
  await cacheStorage.setItem('content-navigation.json', navigation)

  return {
    generatedAt: now,
    generateTime: Date.now() - now,
    contents,
    navigation
  }
})
