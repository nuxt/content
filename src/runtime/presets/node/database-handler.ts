import { eventHandler, getRouterParam } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!

  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || ''
  if (data) {
    const lineStart = `export const ${collection} = "`
    const content = String(data).split('\n').find(line => line.startsWith(lineStart))
    if (content) {
      return content
        .substring(lineStart.length, content.length - 1)
    }
  }

  return await import('#content/dump').then(m => m[collection])
})
