import { eventHandler, getRouterParam } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')!

  let dump = ''

  if (event?.context?.cloudflare?.env.ASSETS) {
    const url = new URL(event.context.cloudflare.request.url)
    url.pathname = `/dump.${collection}.sql`
    dump = await event.context.cloudflare.env.ASSETS.fetch(url).then((r: Response) => r.text())
  }

  if (!dump) {
    dump = await useStorage().getItem(`build:content:raw:dump.${collection}.sql`) || ''
  }

  return dump
})
