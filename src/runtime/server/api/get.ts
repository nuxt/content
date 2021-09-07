import { IncomingMessage } from 'http'
import { getContent } from '../content'

/**
 * Get a content from the database.
 */
export default async (req: IncomingMessage) => {
  const key = req.url || ''
  const content = await getContent(key)

  return {
    key,
    generatedAt: new Date(),
    ...content.meta,
    body: content.body
  }
}
