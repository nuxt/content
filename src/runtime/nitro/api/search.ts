import { IncomingMessage } from 'http'
import { useBody } from 'h3'
import { searchContent } from '../content'

export default async (req: IncomingMessage) => {
  const url = req.url!
  const body = await useBody(req)

  const result = await searchContent(url, body || {})

  return result
}
