import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'docs').select('title').all()
  return { count: docs.length }
})
