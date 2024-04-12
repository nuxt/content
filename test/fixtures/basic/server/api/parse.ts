import { eventHandler, readBody } from 'h3'
import { parseContent } from '#content/server'

export default eventHandler(async (event) => {
  const { id, content, options } = await readBody(event)

  // @ts-expect-error
  const parsedContent = await parseContent(id, content, options)

  return parsedContent
})
