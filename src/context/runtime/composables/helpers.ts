import Vue from 'vue'
import { withLeadingSlash, joinURL } from 'ufo'
import { Context } from '@nuxt/types'

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

          loadComponents(new Set(payload.data[0]?.page?.template))

          return payload
        }
      }

      // Fetch NuxtContent component
      loadComponents(new Set('NuxtContent'))
    })
  }
}

const PREVIEW_PREFIX_REGEX = /\/(_preview\/[0-9a-zA-Z-_]+\/[0-9a-zA-Z-_%]+)/
export const detectPreview = (context: Context) => {
  const { $config, ssrContext, route, params } = context

  // Detect & prepare preview mode
  const path = joinURL(
    (context.$config?._app as any)?.basePath || '',
    withLeadingSlash(params.pathMatch || route.path || '/')
  )

  const preview = path.match(PREVIEW_PREFIX_REGEX)?.[1] || false

  const basePath = preview ? `/${preview}/` : '/'

  // @ts-ignore
  if ($config?._app?.basePath) $config._app.basePath = basePath

  // @ts-ignore
  if (ssrContext?.runtimeConfig?.public?._app?.basePath) ssrContext.runtimeConfig.public._app.basePath = basePath

  return preview
}

export const normalizePreviewScope = (scope: string) => scope.replace('_preview/', '')
