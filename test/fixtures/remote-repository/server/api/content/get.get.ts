import { eventHandler, getQuery } from 'h3'
import { queryCollection } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  const path = String(getQuery(event).path || '/')

  const content = await queryCollection(event, 'content' as never).path(path).first()

  return content
})
