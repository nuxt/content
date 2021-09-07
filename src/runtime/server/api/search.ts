import { IncomingMessage } from 'http'
import { useBody } from 'h3'
import { searchContent } from '../content'

/**
 * Search content from the database.
 */
export default async (req: IncomingMessage) => {
  const url = req.url!
  const unenvBody = (req as any).body
  const body = unenvBody ? JSON.parse(unenvBody) : await useBody(req)
  const result = await searchContent(url, body || {})

  return result
}
