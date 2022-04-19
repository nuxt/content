import { defineEventHandler } from 'h3'
import { queryContent } from '../storage'

// This route is used to cache all the parsed content
export default defineEventHandler(async () => {
  const now = Date.now()
  // Fetch all content
  await queryContent().find()

  return {
    generatedAt: now,
    generateTime: Date.now() - now
  }
})
