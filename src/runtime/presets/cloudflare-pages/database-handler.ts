import { eventHandler, getRouterParam } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!

  const ASSETS = event?.context?.cloudflare?.env.ASSETS || process.env.ASSETS
  if (ASSETS) {
    const url = new URL(event.context.cloudflare?.request?.url || 'http://localhost')
    url.pathname = `/dump.${collection}.sql`
    return await ASSETS.fetch(url).then((r: Response) => r.text())
  }

  return await useStorage().getItem(`build:content:raw:dump.${collection}.sql`) || ''
})
