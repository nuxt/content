import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const rawPath = getQuery(event).path
  const path = Array.isArray(rawPath) ? rawPath[0] : (rawPath || '/')

  return await queryCollection(event, 'content').path(path).first()
})
