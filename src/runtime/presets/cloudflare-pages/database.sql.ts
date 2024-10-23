import { eventHandler } from 'h3'
import { useStorage } from '#imports'

export default eventHandler(async (event) => {
  let dump = ''

  if (event?.context?.cloudflare?.env.ASSETS) {
    const url = new URL(event.context.cloudflare.request.url)
    url.pathname = '/compressed.sql'
    dump = await event.context.cloudflare.env.ASSETS.fetch(url).then((r: Response) => r.text())
  }

  if (!dump) {
    dump = await useStorage().getItem('build:content:raw:compressed.sql') || ''
  }

  return dump
})
