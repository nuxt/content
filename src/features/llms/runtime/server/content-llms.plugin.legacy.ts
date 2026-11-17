import { appendHeader } from 'h3'
import type { NitroApp } from 'nitropack/types'
import { defineNitroPlugin } from 'nitropack/runtime'
import { registerContentLLMSHooks } from './content-llms'
import type { ContentLLMSHooks } from './content-llms'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const prerenderPaths = registerContentLLMSHooks(nitroApp.hooks as unknown as ContentLLMSHooks)

  if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string)) {
    nitroApp.hooks.hook('beforeResponse', (event) => {
      if (event.path === '/') {
        appendHeader(event, 'x-nitro-prerender', Array.from(prerenderPaths))
      }
    })
  }
})
