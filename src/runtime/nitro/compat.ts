import { createApp } from 'h3'
import list from './api/list'
import get from './api/get'
import search from './api/search'

export const createServerMiddleware = (base = 'api') => {
  const app = createApp()

  app.use('/list', list)
  app.use('/get', get)
  app.use('/search', search)

  return {
    path: `/${base}`,
    handler: app
  }
}
