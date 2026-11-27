import { defineEventHandler, getQuery } from 'nuxt/server'
import { forgeState } from '../forge'

// Set how the forge answers and return what was asked of it since the last `?reset`.
export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (query.online !== undefined) forgeState.online = query.online === 'true'
  if (query.down !== undefined) forgeState.down = String(query.down)
  if (query.slow !== undefined) forgeState.slow = Number(query.slow)
  if (query.reset !== undefined) forgeState.asked.length = 0
  return forgeState
})
