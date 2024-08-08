import { eventHandler } from 'h3'

export default eventHandler(() => {
  return import('#content-v3/dump' /* @vite-ignore */).then(m => m.default())
})
