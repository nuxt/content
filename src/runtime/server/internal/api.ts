import { eventHandler, toWebRequest } from 'h3'
import { content } from '#imports'
import type { ContentSurface } from '../content'

// Nitro resolves `content` to the server surface; the shared `#imports` typing is the app client.
export default eventHandler(event => (content as unknown as ContentSurface).handler(toWebRequest(event)))
