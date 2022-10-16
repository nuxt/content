import { defineEventHandler, readBody } from 'h3'
import { parseContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // @ts-ignore
  const parsedContent = await parseContent(body.id || 'content:_file.md', body.content)

  return parsedContent
})
