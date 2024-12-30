export default defineEventHandler(async (event) => {
  const templates = await queryCollection(event, 'templates').all()

  if (!templates) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Templates not found',
    })
  }

  return templates
})
