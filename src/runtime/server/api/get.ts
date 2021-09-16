import { IncomingMessage } from 'http'
import { getContent } from '../content'

/**
 * Get a content from the database.
 */
export default async (req: IncomingMessage) => {
  const key = (req.url || '').split('?')[0].replace(/^\//, '')
  // detect preview mode
  const withPreview = (req.url || '').includes('preview=true')
  const content = await getContent(key, withPreview)

  return {
    key,
    generatedAt: new Date(),
    ...content.meta,
    body: content.body
  }
}
