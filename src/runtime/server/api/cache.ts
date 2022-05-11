import { defineEventHandler } from 'h3'
import { serverQueryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async (event) => {
  const now = Date.now()
  // Fetch all content
  await serverQueryContent(event).find()

  return {
    generatedAt: now,
    generateTime: Date.now() - now
  }
})
