import { IncomingMessage } from 'http'
import { useBody } from 'h3'
// import { clearDatabase } from '../../database'
import { previewStorage } from '../content'
import { useKey, usePreview } from '../utils'

export default async (req: IncomingMessage) => {
  const preview = usePreview(req)
  const key = (preview ? preview + ':' : '') + useKey(req)
  switch (req.method) {
    case 'DELETE':
      if (key) {
        await previewStorage.removeItem(key)
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

      await previewStorage.setItem((preview ? preview + ':' : '') + body.key, body.content)

      // reset database to update preview content
      // clearDatabase()
      break
    }
    case 'GET':
      if (key) {
        return await previewStorage.getKeys()
      } else {
        return await previewStorage.getItem(key)
      }
  }

  return { success: 1 }
}
