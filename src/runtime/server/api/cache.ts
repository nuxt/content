import { defineEventHandler } from 'h3'
import { getContentIndex } from '../content-index'
import { cacheStorage, serverQueryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  const now = Date.now()
  // Fetch all content
  await serverQueryContent(event).find()

  // Generate Index
  await getContentIndex(event)

  const navigation = await $fetch('/api/_content/navigation')
  await cacheStorage.setItem('content-navigation.json', navigation)

  return {
    generatedAt: now,
    generateTime: Date.now() - now
  }
})
