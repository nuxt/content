import { IncomingMessage } from 'http'
import { useBody } from 'h3'
import { searchContent } from '../content'

/**
 * Search content from the database.
 */
export default async (req: IncomingMessage) => {
  const id = (req.url || '').split('?')[0].replace(/^\//, '')
  // detect preview mode
  const withPreview = (req.url || '').includes('preview=true')
  let body = (req as any).body || (await useBody(req))
  if (typeof body === 'string') {
    body = JSON.parse(body)
  }

  const result = await searchContent(id, body || {}, withPreview)

  return result
}
