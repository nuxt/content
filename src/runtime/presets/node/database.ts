import { eventHandler } from 'h3'
import { useStorage } from '#imports'

export default eventHandler(async () => {
  let dump = await useStorage().getItem('build:content:raw:compressed.sql') || ''

  if (!dump) {
    // @ts-expect-error -- This is a dynamic import
    dump = await import('#content/dump').then(m => m.default)
  }

  return { dump }
})
