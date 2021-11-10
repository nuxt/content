import { IncomingMessage } from 'http'
import { useBody } from 'h3'
import { buildContent, buildStorage } from '../content'

interface Body {
  key: string
  event: 'remove' | 'update'
}

/**
 * Reload the database.
 */
export default async (req: IncomingMessage) => {
  const { key, event } = await useBody<Body>(req)

  if (event === 'remove') {
    buildStorage.removeItem(key)
  } else if (await buildStorage.hasItem(key)) {
    // Rebuild/Reload content
    await buildContent(key)
  }

  return true
}
