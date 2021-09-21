import { IncomingMessage } from 'http'
import { getContent } from '../content'
import { useKey, usePreview } from '../utils'

/**
 * Get a content from the database.
 */
export default async (req: IncomingMessage) => {
  const key = useKey(req)
  // detect preview mode
  const previewKey = usePreview(req)
  const content = await getContent(key, previewKey)

  return {
    key,
    generatedAt: new Date(),
    ...content.meta,
    body: content.body
  }
}
