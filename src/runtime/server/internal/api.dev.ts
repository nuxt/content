import { eventHandler, toWebRequest } from 'h3'
import { cms } from '#imports'
import type { ContentSurface } from '../cms'

export default eventHandler(async (event) => {
  const optionsString = (globalThis as { _importMeta_?: { env?: Record<string, string | undefined> } })._importMeta_?.env?.NUXT_VITE_NODE_OPTIONS
  if (optionsString) {
    const options = JSON.parse(optionsString)
    if (options.baseURL) {
      return $fetch(`/__NCDEV__${event.path}`, {
        baseURL: options.baseURL,
      })
    }
  }

  // Nitro resolves `cms` to the server surface; the shared `#imports` typing is the app client.
  return (cms as unknown as ContentSurface).handler(toWebRequest(event))
})
