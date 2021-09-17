import { IncomingMessage } from 'http'
import { useBody } from 'h3'
// import { clearDatabase } from '../../database'
import { previewStorage } from '../content'

export default async (req: IncomingMessage) => {
  const id = (req.url || '').split('?')[0].replace(/^\//, '')
  switch (req.method) {
    case 'DELETE':
      if (id) {
        await previewStorage.removeItem(id)
      } else {
        await previewStorage.clear()
      }
      // reset database to update preview content
      // clearDatabase()
      break
    case 'POST': {
      let body = (req as any).body || (await useBody(req))
      if (typeof body === 'string') {
        body = JSON.parse(body)
      }

      await previewStorage.setItem(body.key, body.content)

      // reset database to update preview content
      // clearDatabase()
      break
    }
    case 'GET':
      if (id) {
        return await previewStorage.getKeys()
      } else {
        return await previewStorage.getItem(id)
      }
  }

  return { success: 1 }
}
