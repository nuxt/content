import { eventHandler, getRouterParam } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!

  if (event?.context?.cloudflare?.env.ASSETS) {
    const url = new URL(event.context.cloudflare.request.url)
    url.pathname = `/dump.${collection}.sql`
    return await event.context.cloudflare.env.ASSETS.fetch(url).then((r: Response) => r.text())
  }

  return await useStorage().getItem(`build:content:raw:dump.${collection}.sql`) || ''
})
