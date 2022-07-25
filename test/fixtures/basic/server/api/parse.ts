import { defineEventHandler, useBody } from 'h3'
import { parseContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const { id, content, options } = await useBody(event)

  // @ts-ignore
  const parsedContent = await parseContent(id, content, options)

  return parsedContent
})
