import { IncomingMessage } from 'http'
import { useQuery } from 'h3'
import { getList } from '../content'

/**
 * List a contents from the database.
 */
export default async (req: IncomingMessage) => {
  const id = (req.url || '').split('?')[0].replace(/^\//, '')
  // detect preview mode
  const withPreview = (req.url || '').includes('preview=true')
  let items: any[] = await getList(id, withPreview)

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
