import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const path = getQuery(event).path || '/'

  const content = await queryCollection(event, 'content').path(path).first()

  return content
})
