import { eventHandler } from 'h3'

export default eventHandler(() => {
  // @ts-expect-error - Vite doesn't know about the import
  return import('#content-v3/dump' /* @vite-ignore */)
    .then(m => m.default()) as Promise<string[]>
})
