import { IncomingMessage } from 'http'
import { useQuery } from 'h3'

export function usePreview(req: IncomingMessage) {
  const query = useQuery(req)

  return (query.preview as string) || ''
}

export function useKey(req: IncomingMessage) {
  return (req.url || '').split('?')[0].replace(/^\//, '')
}
