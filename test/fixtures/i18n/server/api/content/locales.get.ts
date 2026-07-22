import { eventHandler, getQuery } from 'h3'

export default eventHandler(async (event) => {
  const { collection, stem } = getQuery(event) as { collection?: string, stem?: string }

  if (!collection || !stem) {
    throw new Error('collection and stem are required')
  }

  return await queryCollectionLocales(event, collection as 'blog', stem)
})
