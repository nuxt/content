import { defineEventHandler } from 'nuxt/server'
import { content } from '#imports'
import type { ContentSurface } from '../content'

// Nitro resolves `content` to the server surface; the shared `#imports` typing is the app client.
export default defineEventHandler(event => (content as unknown as ContentSurface).handler(event.req))
