import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const path = getQuery(event).path || '/'

  return await queryCollection(event, 'content').path(path).first()
})
