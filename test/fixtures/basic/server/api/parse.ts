import { defineEventHandler, useBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { id, content } = await useBody(event)

  // @ts-ignore
  const parsedContent = await contentParse(id, content).then(contentTransform)

  return parsedContent
})
