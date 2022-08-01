import { defineEventHandler } from 'h3'
import { cacheStorage, serverQueryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  const now = Date.now()
  // Fetch all content
  const data = await serverQueryContent(event).find()

  // Generate Index
  const index = data.reduce((acc, item) => {
    acc[item._path!] = item._id
    return acc
  }, {} as Record<string, string>)
  await cacheStorage.setItem('index.json', index)

  return {
    generatedAt: now,
    generateTime: Date.now() - now
  }
})
