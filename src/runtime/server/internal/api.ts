import { eventHandler, toWebRequest } from 'h3'
import { cms } from '#imports'
import type { ContentSurface } from '../cms'

// Nitro resolves `cms` to the server surface; the shared `#imports` typing is the app client.
export default eventHandler(event => (cms as unknown as ContentSurface).handler(toWebRequest(event)))
