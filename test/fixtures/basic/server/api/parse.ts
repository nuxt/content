import { defineEventHandler, useBody } from 'h3'
import { parseContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const { id, content } = await useBody(event)

  // @ts-ignore
  const parsedContent = await parseContent(id, content)

  return parsedContent
})
