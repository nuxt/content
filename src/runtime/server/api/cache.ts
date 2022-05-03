import { defineEventHandler } from 'h3'
import { cacheStorage, queryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async () => {
  const now = Date.now()
  // Fetch all content
  const items = await queryContent().find()

  await cacheStorage.setItem('-manifest.json', {
    count: items.length,
    generatedAt: now,
    generateTime: Date.now() - now
  })

  return {
    generatedAt: now,
    generateTime: Date.now() - now
  }
})
