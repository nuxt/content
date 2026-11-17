import { eventHandler, getRouterParam, setHeader } from 'h3'
import { useStorage } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection')! || event.path?.split('/')?.[2] || ''
  setHeader(event, 'Content-Type', 'text/plain')

  const ASSETS = event?.context?.cloudflare?.env.ASSETS || process.env.ASSETS
  if (ASSETS) {
    const config = event?.context?.nitro?.runtimeConfig
    const url = new URL(event.context.cloudflare?.request?.url || 'http://localhost')
    url.pathname = `${config?.app?.baseURL || '/'}dump.${collection}.sql`
    return await ASSETS.fetch(url).then((r: Response) => r.text())
  }

  return await useStorage().getItem(`build:content:raw:dump.${collection}.sql`) || ''
})
