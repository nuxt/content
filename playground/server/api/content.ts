export default defineEventHandler(async (event) => {
  const params = getQuery<{
    path: string
  }>(event)
  return queryCollection(event, 'content').path(params.path).first()
})
