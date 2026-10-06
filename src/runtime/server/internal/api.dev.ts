import { defineEventHandler } from 'nuxt/server'
import { content } from '#imports'
import type { ContentSurface } from '../content'

export default defineEventHandler(async (event) => {
  const optionsString = (globalThis as { _importMeta_?: { env?: Record<string, string | undefined> } })._importMeta_?.env?.NUXT_VITE_NODE_OPTIONS
  if (optionsString) {
    const options = JSON.parse(optionsString)
    if (options.baseURL) {
      return $fetch(`/__NCDEV__${event.url.pathname}${event.url.search}`, {
        baseURL: options.baseURL,
      })
    }
  }

  // Nitro resolves `content` to the server surface; the shared `#imports` typing is the app client.
  return (content as unknown as ContentSurface).handler(event.req)
})
