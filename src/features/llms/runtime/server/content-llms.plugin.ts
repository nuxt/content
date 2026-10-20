import { registerContentLLMSHooks } from './content-llms'
import type { ContentLLMSHooks } from './content-llms'

interface NitroApp {
  hooks: ContentLLMSHooks
}

// Nitro 3 plugin, `definePlugin` from `nitro` only returns the function it is given
export default (nitroApp: NitroApp) => {
  const prerenderPaths = registerContentLLMSHooks(nitroApp.hooks)

  if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
    nitroApp.hooks.hook('response', (response: Response, event: { req: Request }) => {
      if (new URL(event.req.url).pathname === '/' && prerenderPaths.size) {
        response.headers.append('x-nitro-prerender', Array.from(prerenderPaths).join(', '))
      }
    })
  }
}
