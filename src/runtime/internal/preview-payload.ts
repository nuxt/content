import type { ComponentMeta } from 'vue-component-meta'
import type { RuntimeConfig } from '@nuxt/content'
// @ts-expect-error import does exist
import components from '#nuxt-component-meta/nitro'
import { collections, gitInfo, appConfigSchema } from '#content/preview'

interface NuxtComponentMeta {
  pascalName: string
  filePath: string
  meta: ComponentMeta
  global: boolean
}

export function createPreviewPayload(appConfig: object, runtimeConfig: object) {
  const mappedComponents = (Object.values(components) as NuxtComponentMeta[])
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta: {
          props: meta.props,
          slots: meta.slots,
          events: meta.events,
        },
      }
    })

  const { content, public: { preview } } = runtimeConfig as { content: RuntimeConfig['content'], public: { preview?: unknown } }
  const { version } = content

  return {
    version,
    preview,
    gitInfo,
    collections,
    appConfigSchema,
    appConfig,
    components: mappedComponents,
  }
}
