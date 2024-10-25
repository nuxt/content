import { eventHandler, getRouterParam } from 'h3'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!

  return await import('#content/dump').then(m => m[collection])
})
