import { defineEventHandler, getQuery } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const path = getQuery<{ path?: string }>(event).path || '/'

  const content = await queryCollection(event, 'content').path(path).first()
  const navigation = await queryCollectionNavigation(event, 'content')

  return { content, navigation }
})
