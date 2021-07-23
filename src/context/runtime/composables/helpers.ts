import Vue from 'vue'
import { DocusAddonContext } from '../../../types'

export const docusInit = ({ context, state }: DocusAddonContext) => {
  if (process.server) {
    context.beforeNuxtRender(({ nuxtState }: any) => (nuxtState.docus = state))
  }
}

export const clientAsyncData = ($nuxt: any) => {
  if (process.client) {
    const loadedComponents = new Set()
    const loadComponents = function (components?: Set<string>) {
      if (!components) return
      return Array.from(components).map(async function (name) {
        const component: any = Vue.component(name)
        if (!loadedComponents.has(name) && typeof component === 'function' && !component.options) {
          loadedComponents.add(name)
          try {
            // @ts-ignore
            await Vue.component(name)()
          } catch (e) {}
        }
      })
    }
    window.onNuxtReady((nuxt: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      $nuxt = nuxt

      // Workaround for Vue 2 since <Suspense> does not exists
      const originalFetchPayload = $nuxt.fetchPayload
      if (originalFetchPayload) {
        $nuxt.fetchPayload = async function (...args: any[]) {
          const payload = await originalFetchPayload(...args)

          // await loadComponents(payload.fetch?._lazyComponents)
          await loadComponents(new Set(payload.data[0]?.page?.template))

          return payload
        }
      }
      // Fetch NuxtContent component
      loadComponents(new Set('NuxtContent'))
    })
  }
}
