import { IncomingMessage } from 'http'
import { createApp } from 'h3'
import { Nuxt, addServerMiddleware } from '@nuxt/kit'
import list from './api/list'
import get from './api/get'
import search from './api/search'
import { useWebSocket } from './socket'

export const createServerMiddleware = (options: any, nuxt: Nuxt) => {
  const app = createApp()

  app.use('/list', list)
  app.use('/get', get)
  app.use('/search', search)

  if (options.watch) {
    const ws = useWebSocket(options, nuxt)
    app.use('/ws', (req: IncomingMessage) => ws.serve(req))
  }

  addServerMiddleware({
    path: `/${options.apiBase}`,
    handler: app
  })
}
