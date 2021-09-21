import { IncomingMessage } from 'http'
import { useQuery } from 'h3'
import { getList } from '../content'
import { useKey, usePreview } from '../utils'

/**
 * List a contents from the database.
 */
export default async (req: IncomingMessage) => {
  const key = useKey(req)
  // detect preview mode
  const previewKey = usePreview(req)
  let items: any[] = await getList(key, previewKey)

  const { q } = useQuery(req)

  if (q) {
    items = items.filter(item => {
      return item.id.includes(String(q)) || (item.meta.title || '').includes(q)
    })
  }

  return {
    generatedAt: new Date(),
    items
  }
}
