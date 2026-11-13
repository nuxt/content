import { useRuntimeConfig } from 'nuxt/server'
import { withoutBase } from 'ufo'
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
      const path = withoutBase(new URL(event.req.url).pathname, useRuntimeConfig().app.baseURL)
      if (path === '/' && prerenderPaths.size) {
        response.headers.append('x-nitro-prerender', Array.from(prerenderPaths).join(', '))
      }
    })
  }
}
