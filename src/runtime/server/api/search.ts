import { IncomingMessage } from 'http'
import { useBody } from 'h3'
import { searchContent } from '../content'
import { useKey, usePreview } from '../utils'

/**
 * Search content from the database.
 */
export default async (req: IncomingMessage) => {
  const key = useKey(req)
  // detect preview mode
  const previewKey = usePreview(req)
  let body = (req as any).body || (await useBody(req))
  if (typeof body === 'string') {
    body = JSON.parse(body)
  }

  const result = await searchContent(key, body || {}, previewKey)

  return result
}
