import { handleCors } from 'h3'

export default defineEventHandler(async (event) => {
  const didHandleCors = handleCors(event, {
    origin: ['https://nuxt.studio', 'https://dev.nuxt.studio'],
    preflight: {
      statusCode: 204,
    },
    methods: '*',
  })

  if (didHandleCors) {
    return
  }

  const templates = await queryCollection(event, 'templates').all()

  if (!templates) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Templates not found',
    })
  }

  return templates
})
