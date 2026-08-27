import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const collection = (getQuery(event).collection as string) || 'content'
  return queryCollection(event, collection as never).all()
})
