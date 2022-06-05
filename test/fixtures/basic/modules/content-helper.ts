import { createResolver, defineNuxtModule, useNuxt } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    const nuxt = useNuxt()

    const resolver = createResolver(import.meta.url)

    nuxt.hooks.hook('content:context', (ctx) => {
      ctx.transformers.push(resolver.resolve('../addons/custom-transformer'))
    })
  }
})
