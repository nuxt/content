export default defineEventHandler(async () => {
  const templates = await queryCollection('templates').all()

  console.log('templates :', templates)

  if (!templates) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Templates not found',
    })
  }

  return templates
})
