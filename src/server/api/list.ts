import { IncomingMessage } from 'http'
import { useQuery } from 'h3'
import { getList } from '../content'

export default async (req: IncomingMessage) => {
  const id = (req.url || '').split('?')[0]
  let items = await getList(id)

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
