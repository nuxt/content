import { eventHandler, setHeader } from 'h3'
import { manifestVersion } from '#content/manifest'

export default eventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Cache-Control', 'no-store')

  return {
    version: manifestVersion || '',
  }
})
