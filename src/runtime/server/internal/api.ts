import { defineEventHandler } from 'nuxt/server'
import { content } from '#imports'
import type { ContentSurface } from '../content'
import { resolveContentFor } from '../live'

// Nitro resolves `content` to the server surface; the shared `#imports` typing is the app client.
export default defineEventHandler(async (event) => {
  // Source of the build snapshot route being prerendered.
  const source = import.meta.prerender ? event.url.pathname.match(/^\/__nuxt_content\/(?:manifest|snapshot)\/([^/.]+)(?:\.json)?$/)?.[1] : undefined
  return (await resolveContentFor(content as unknown as ContentSurface, source)).handler(event.req)
})
